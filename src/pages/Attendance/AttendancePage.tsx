import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceApi, type AttendanceWithCourse } from '../../api/attendance.api';
import { groupsApi, type Group } from '../../api/groups.api';
import { coursesApi, type Course } from '../../api/courses.api';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';

interface AttendanceWithEnrollment {
  id: number;
  enrollmentId: number;
  date: string;
  status: string;
  enrollment?: {
    user?: {
      id: number;
      name: string;
    };
  };
}

interface StudentAttendance {
  enrollmentId: number;
  studentId: number;
  studentName: string;
  attendance: Array<{ id: number; date: string; status: string }>;
}

export default function AttendancePage() {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState<AttendanceWithCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  const [selectedGroup, setSelectedGroup] = useState<number | ''>('');
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isAdmin, isProfesor, isAlumno, user } = useAuth();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupAttendance();
    }
  }, [selectedGroup]);

  const loadInitialData = async () => {
    try {
      if (isAlumno) {
        const res = await attendanceApi.getMyAttendance();
        setAttendanceData(res.data || []);
      } else if (isAdmin || isProfesor) {
        const coursesRes = await coursesApi.getAll();
        setCourses(coursesRes.data);
        
        const groupsRes = await groupsApi.getAll();
        const myGroups = isProfesor && user 
          ? groupsRes.data.filter((g: any) => g.teacherId === user.id)
          : groupsRes.data;
        setGroups(myGroups);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId ? Number(courseId) : '');
    setSelectedGroup('');
  };

  const filteredGroups = selectedCourse 
    ? groups.filter(g => g.courseId === selectedCourse)
    : groups;

  const loadGroupAttendance = async () => {
    try {
      setIsLoading(true);
      const res = await attendanceApi.getByGroup(Number(selectedGroup));
      const data: AttendanceWithEnrollment[] = res.data || [];
      
      const studentsMap = new Map<number, StudentAttendance>();
      
      for (const att of data) {
        const enrollmentId = att.enrollmentId;
        const studentId = att.enrollment?.user?.id ?? 0;
        const studentName = att.enrollment?.user?.name || 'Sin nombre';
        
        if (!studentsMap.has(enrollmentId)) {
          studentsMap.set(enrollmentId, {
            enrollmentId,
            studentId,
            studentName,
            attendance: [],
          });
        }
        
        studentsMap.get(enrollmentId)!.attendance.push({
          id: att.id,
          date: att.date,
          status: att.status,
        });
      }
      
      const students = Array.from(studentsMap.values()).map(s => ({
        ...s,
        attendance: s.attendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      }));
      
      setStudentAttendance(students);
    } catch (error) {
      console.error('Error loading group attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string): 'success' | 'danger' | 'warning' | 'info' => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'danger';
      case 'late': return 'warning';
      default: return 'info';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Presente';
      case 'absent': return 'Ausente';
      case 'late': return 'Tarde';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const selectedStudentData = selectedStudent 
    ? studentAttendance.find(s => s.enrollmentId === selectedStudent) 
    : null;

  if (isAlumno) {
    if (isLoading) {
      return (
        <Navbar>
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500">Cargando...</p>
          </div>
        </Navbar>
      );
    }

    return (
      <Navbar>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Mi Asistencia</h1>
          <p className="text-slate-500 mt-1">Historial de tu asistencia</p>
        </div>

        {attendanceData.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-center text-slate-500">No tienes historial de asistencia</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {attendanceData.map((courseData, idx) => (
              <Card key={idx}>
                <CardContent>
                  <h3 className="font-semibold text-slate-800 mb-3">{courseData.course}</h3>
                  <p className="text-sm text-slate-500 mb-4">{courseData.group} - {courseData.courseLevel}</p>
                  
                  <div className="space-y-2">
                    {courseData.attendance.map((att, attIdx) => (
                      <div key={attIdx} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">{formatDate(att.date)}</span>
                        <Badge variant={getStatusVariant(att.status)}>
                          {getStatusLabel(att.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Navbar>
    );
  }

  if (isAdmin || isProfesor) {
    return (
      <Navbar>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Asistencia</h1>
          <p className="text-slate-500 mt-1">Registro de asistencia por grupo</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={selectedCourse}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="">Selecciona un curso</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={selectedGroup}
            onChange={(e) => { setSelectedGroup(e.target.value ? Number(e.target.value) : ''); setSelectedStudent(null); }}
            disabled={!selectedCourse}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50"
          >
            <option value="">Selecciona un grupo</option>
            {filteredGroups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {selectedGroup && studentAttendance.length > 0 && !selectedStudent && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentAttendance.map(student => {
              const present = student.attendance.filter(a => a.status === 'present').length;
              const absent = student.attendance.filter(a => a.status === 'absent').length;
              const late = student.attendance.filter(a => a.status === 'late').length;
              const total = student.attendance.length;
              const percent = total > 0 ? Math.round((present + late) / total * 100) : 0;
              
              return (
                <Card key={student.enrollmentId} className="cursor-pointer hover:shadow-md transition-shadow" 
                  onClick={() => setSelectedStudent(student.enrollmentId)}>
                  <CardContent>
                    <h3 className="font-semibold text-slate-800">{student.studentName}</h3>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="success">{present} P</Badge>
                      <Badge variant="danger">{absent} A</Badge>
                      <Badge variant="warning">{late} T</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{percent}% asistencia</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {selectedStudent && selectedStudentData && (
          <div>
            <button 
              onClick={() => setSelectedStudent(null)}
              className="mb-4 text-indigo-600 hover:text-indigo-700 text-sm"
            >
              ← Volver a la lista
            </button>
            <Card>
              <CardContent>
                <h3 className="font-semibold text-slate-800 text-lg mb-4">
                  {selectedStudentData.studentName}
                </h3>
                <div className="space-y-2">
                  {selectedStudentData.attendance.map(att => (
                    <div key={att.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">{formatDate(att.date)}</span>
                      <Badge variant={getStatusVariant(att.status)}>
                        {getStatusLabel(att.status)}
                      </Badge>
                    </div>
                  ))}
                  {selectedStudentData.attendance.length === 0 && (
                    <p className="text-center text-slate-500 py-4">No hay registros de asistencia</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!selectedGroup && (
          <Card>
            <CardContent>
              <p className="text-center text-slate-500">Selecciona un grupo para ver la asistencia</p>
            </CardContent>
          </Card>
        )}
      </Navbar>
    );
  }

  useEffect(() => {
    if (!isAlumno && !isAdmin && !isProfesor) {
      navigate('/dashboard');
    }
  }, []);

  if (!isAlumno && !isAdmin && !isProfesor) {
    return null;
  }

return (
    <Navbar>
      <p>Cargando...</p>
    </Navbar>
  );
}
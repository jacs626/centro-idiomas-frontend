import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { attendanceApi, type AttendanceWithCourse } from '../../api/attendance.api';
import { groupsApi, type Group } from '../../api/groups.api';
import { coursesApi, type Course } from '../../api/courses.api';
import { enrollmentsApi } from '../../api/enrollments.api';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/layout/Navbar';
import CourseGroupFilter from '../../components/filters/CourseGroupFilter';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [newAttendance, setNewAttendance] = useState({ enrollmentId: '', date: '', status: 'present' });
  const [isSaving, setIsSaving] = useState(false);

  const { isAdmin, isProfesor, isAlumno, user } = useAuth();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      loadGroupAttendance();
    } else if (selectedCourse) {
      setStudentAttendance([]);
      setSelectedStudent(null);
    }
  }, [selectedGroup, selectedCourse]);

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

  const handleCourseChange = (courseId: number | '') => {
    setSelectedCourse(courseId);
    setSelectedGroup('');
    setSelectedStudent(null);
  };

  const handleGroupChange = (groupId: number | '') => {
    const groupIdNum = Number(groupId);
    if (groupIdNum) {
      setSelectedGroup(groupIdNum);
    } else {
      setSelectedGroup('');
    }
  };

  const filteredGroups = useMemo(() => {
    if (!selectedCourse) return groups;
    return groups.filter(g => g.courseId === selectedCourse);
  }, [groups, selectedCourse]);

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

  const loadEnrollments = async () => {
    if (!selectedGroup) return;
    try {
      const res = await enrollmentsApi.getByGroup(Number(selectedGroup));
      setEnrollments(res.data || []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    }
  };

  const handleOpenAddModal = async () => {
    await loadEnrollments();
    setNewAttendance({ enrollmentId: '', date: new Date().toISOString().split('T')[0], status: 'present' });
    setShowAddModal(true);
  };

  const handleSaveAttendance = async () => {
    if (!newAttendance.enrollmentId || !newAttendance.date) return;
    setIsSaving(true);
    try {
      await attendanceApi.create({
        enrollmentId: Number(newAttendance.enrollmentId),
        date: newAttendance.date,
        status: newAttendance.status,
      });
      setShowAddModal(false);
      loadGroupAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setIsSaving(false);
    }
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

        <div className="mb-6">
          <CourseGroupFilter
            courses={courses}
            groups={filteredGroups}
            selectedCourse={selectedCourse}
            selectedGroup={selectedGroup}
            onCourseChange={handleCourseChange}
            onGroupChange={handleGroupChange}
            coursePlaceholder="Selecciona un curso"
            groupPlaceholder="Selecciona un grupo"
          />
        </div>

        {selectedCourse && !selectedGroup && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map(group => (
              <Card 
                key={group.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedGroup(group.id)}
              >
                <CardContent>
                  <h3 className="font-semibold text-slate-800">{group.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">Horario: {group.schedule || 'No definido'}</p>
                </CardContent>
              </Card>
            ))}
            {filteredGroups.length === 0 && (
              <p className="text-slate-500">No hay grupos para este curso</p>
            )}
          </div>
        )}

        {selectedGroup && !selectedStudent && (
          <div className="mb-4">
            <Button onClick={handleOpenAddModal}>
              + Agregar Asistencia Manual
            </Button>
          </div>
        )}

        {selectedGroup && studentAttendance.length === 0 && !selectedStudent && !isLoading && (
          <Card>
            <CardContent>
              <p className="text-center text-slate-500 mb-4">No hay registros de asistencia para este grupo</p>
              <div className="flex justify-center">
                <Button onClick={handleOpenAddModal}>
                  + Agregar Asistencia
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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

        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent>
                <h3 className="font-semibold text-lg mb-4">Agregar Asistencia</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Alumno</label>
                    <select
                      value={newAttendance.enrollmentId}
                      onChange={(e) => setNewAttendance({ ...newAttendance, enrollmentId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="">Selecciona un alumno</option>
                      {enrollments.map((enr) => (
                        <option key={enr.id} value={enr.id}>
                          {enr.user?.name || `Alumno #${enr.userId}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={newAttendance.date}
                      onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Estado</label>
                    <select
                      value={newAttendance.status}
                      onChange={(e) => setNewAttendance({ ...newAttendance, status: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    >
                      <option value="present">Presente</option>
                      <option value="absent">Ausente</option>
                      <option value="late">Tarde</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveAttendance} disabled={isSaving || !newAttendance.enrollmentId} className="flex-1">
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
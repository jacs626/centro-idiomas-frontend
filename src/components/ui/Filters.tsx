import { useState, useEffect } from 'react';
import { coursesApi, type Course } from '../../api/courses.api';
import { groupsApi, type Group } from '../../api/groups.api';

export interface FiltersProps {
  onChange?: (filters: { courseId: string; groupId: string }) => void;
  showStatus?: boolean;
  statusOptions?: { value: string; label: string }[];
  initialFilters?: { courseId?: string; groupId?: string; status?: string };
  onStatusChange?: (status: string) => void;
  showCourse?: boolean;
}

export function Filters({
  onChange,
  showStatus = false,
  statusOptions,
  initialFilters,
  onStatusChange,
  showCourse = true,
}: FiltersProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filters, setFilters] = useState({
    courseId: initialFilters?.courseId || '',
    groupId: initialFilters?.groupId || '',
    status: initialFilters?.status || '',
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await coursesApi.getAll();
      setCourses(response.data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadGroups = async (courseId: number) => {
    try {
      const response = await groupsApi.getByCourse(courseId);
      setGroups(response.data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const handleCourseChange = (courseId: string) => {
    const newFilters = { ...filters, courseId, groupId: '' };
    setFilters(newFilters);
    
    if (courseId) {
      loadGroups(Number(courseId));
    } else {
      setGroups([]);
    }
    
    onChange?.(newFilters);
  };

  const handleGroupChange = (groupId: string) => {
    const newFilters = { ...filters, groupId };
    setFilters(newFilters);
    onChange?.(newFilters);
  };

  const handleStatusChange = (status: string) => {
    const newFilters = { ...filters, status };
    setFilters(newFilters);
    onStatusChange?.(status);
  };

  const defaultStatusOptions = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'paid', label: 'Pagado' },
    { value: 'late', label: 'Vencido' },
  ];

  const options = statusOptions || defaultStatusOptions;

  return (
    <div className="flex flex-wrap gap-4 mb-4 p-4 bg-white rounded-lg border border-slate-200">
      {showCourse && (
        <div>
          <label className="block text-xs text-slate-500 mb-1">Curso</label>
          <select
            value={filters.courseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="">Todos los cursos</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name} - {course.level}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs text-slate-500 mb-1">Grupo</label>
        <select
          value={filters.groupId}
          onChange={(e) => handleGroupChange(e.target.value)}
          disabled={!filters.courseId}
          className="px-3 py-2 border border-slate-300 rounded-md text-sm disabled:opacity-50"
        >
          <option value="">Todos los grupos</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>
      {showStatus && (
        <div>
          <label className="block text-xs text-slate-500 mb-1">Estado</label>
          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
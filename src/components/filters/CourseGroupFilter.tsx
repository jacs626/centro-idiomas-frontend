import { useMemo } from 'react';
import { type Course } from '../../api/courses.api';
import { type Group } from '../../api/groups.api';

interface CourseGroupFilterProps {
  courses: Course[];
  groups: Group[];
  selectedCourse: number | '';
  selectedGroup: number | '';
  onCourseChange: (courseId: number | '') => void;
  onGroupChange: (groupId: number | '') => void;
  allowAllCourses?: boolean;
  allowAllGroups?: boolean;
  coursePlaceholder?: string;
  groupPlaceholder?: string;
}

export default function CourseGroupFilter({
  courses,
  groups,
  selectedCourse,
  selectedGroup,
  onCourseChange,
  onGroupChange,
  allowAllCourses = true,
  allowAllGroups = true,
  coursePlaceholder = 'Todos los cursos',
  groupPlaceholder = 'Todos los grupos',
}: CourseGroupFilterProps) {
  const filteredGroups = useMemo(() => {
    if (!selectedCourse) return groups;
    return groups.filter(g => g.courseId === selectedCourse);
  }, [groups, selectedCourse]);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value ? Number(e.target.value) : '';
    onCourseChange(courseId);
    onGroupChange('');
  };

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onGroupChange(e.target.value ? Number(e.target.value) : '');
  };

  return (
    <div className="flex gap-4 flex-wrap">
      <select
        value={selectedCourse}
        onChange={handleCourseChange}
        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
      >
        <option value="">{coursePlaceholder}</option>
        {courses.map(c => (
          <option key={c.id} value={c.id}>{c.name} - {c.level}</option>
        ))}
      </select>
      <select
        value={selectedGroup}
        onChange={handleGroupChange}
        disabled={!selectedCourse}
        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{groupPlaceholder}</option>
        {filteredGroups.map(g => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>
    </div>
  );
}
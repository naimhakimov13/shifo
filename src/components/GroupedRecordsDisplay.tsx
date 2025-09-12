import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Filter, 
  BarChart3,
  Eye,
  EyeOff,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { groupRecordsByField, getGroupStatistics, filterGroupedRecords, GroupConfig, STATUS_LABELS } from '../utils/recordGrouping';

interface GroupedRecordsDisplayProps<T> {
  records: T[];
  groupByField: keyof T;
  title: string;
  renderRecord: (record: T, index: number) => React.ReactNode;
  searchFields: (keyof T)[];
  config?: GroupConfig;
  className?: string;
  showStatistics?: boolean;
  allowGroupToggle?: boolean;
  emptyMessage?: string;
  getGroupColor?: (groupName: string) => string;
  getGroupIcon?: (groupName: string) => React.ReactNode;
}

export function GroupedRecordsDisplay<T>({
  records,
  groupByField,
  title,
  renderRecord,
  searchFields,
  config = {},
  className = '',
  showStatistics = true,
  allowGroupToggle = true,
  emptyMessage = 'Записи не найдены',
  getGroupColor,
  getGroupIcon
}: GroupedRecordsDisplayProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'alphabetical' | 'count' | 'custom'>(config.sortBy || 'custom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(config.sortOrder || 'asc');
  const [showEmptyGroups, setShowEmptyGroups] = useState(config.showEmptyGroups || false);

  // Group and filter records
  const groupedRecords = useMemo(() => {
    const grouped = groupRecordsByField(records, groupByField, {
      ...config,
      sortBy,
      sortOrder,
      showEmptyGroups
    });

    return filterGroupedRecords(grouped, searchTerm, searchFields);
  }, [records, groupByField, searchTerm, searchFields, sortBy, sortOrder, showEmptyGroups, config]);

  // Calculate statistics
  const statistics = useMemo(() => {
    return getGroupStatistics(groupedRecords);
  }, [groupedRecords]);

  // Toggle group collapse state
  const toggleGroup = (groupName: string) => {
    if (!allowGroupToggle) return;

    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(groupName)) {
      newCollapsed.delete(groupName);
    } else {
      newCollapsed.add(groupName);
    }
    setCollapsedGroups(newCollapsed);
  };

  // Toggle all groups
  const toggleAllGroups = (collapse: boolean) => {
    if (collapse) {
      setCollapsedGroups(new Set(Object.keys(groupedRecords)));
    } else {
      setCollapsedGroups(new Set());
    }
  };

  // Get group display name
  const getGroupDisplayName = (groupName: string) => {
    return STATUS_LABELS[groupName as keyof typeof STATUS_LABELS] || groupName;
  };

  // Get default group color
  const getDefaultGroupColor = (groupName: string) => {
    const colorMap: Record<string, string> = {
      scheduled: 'bg-blue-100 border-blue-200 text-blue-800',
      completed: 'bg-green-100 border-green-200 text-green-800',
      cancelled: 'bg-red-100 border-red-200 text-red-800',
      'no-show': 'bg-gray-100 border-gray-200 text-gray-800',
      pending: 'bg-yellow-100 border-yellow-200 text-yellow-800',
      paid: 'bg-green-100 border-green-200 text-green-800',
      failed: 'bg-red-100 border-red-200 text-red-800',
      refunded: 'bg-purple-100 border-purple-200 text-purple-800',
      active: 'bg-emerald-100 border-emerald-200 text-emerald-800',
      inactive: 'bg-gray-100 border-gray-200 text-gray-800',
      archived: 'bg-slate-100 border-slate-200 text-slate-800'
    };
    
    return colorMap[groupName] || 'bg-gray-100 border-gray-200 text-gray-800';
  };

  const hasRecords = Object.keys(groupedRecords).length > 0;
  const allCollapsed = collapsedGroups.size === Object.keys(groupedRecords).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {showStatistics && hasRecords && (
            <p className="text-sm text-gray-600 mt-1">
              {statistics.totalRecords} записей в {statistics.totalGroups} группах
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Поиск записей..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
            />
          </div>

          {/* Sort options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
          >
            <option value="custom">По статусу</option>
            <option value="alphabetical">По алфавиту</option>
            <option value="count">По количеству</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title={`Сортировка: ${sortOrder === 'asc' ? 'по возрастанию' : 'по убыванию'}`}
          >
            {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
          </button>

          {/* Toggle all groups */}
          {allowGroupToggle && hasRecords && (
            <button
              onClick={() => toggleAllGroups(!allCollapsed)}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              title={allCollapsed ? 'Развернуть все' : 'Свернуть все'}
            >
              {allCollapsed ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      {showStatistics && hasRecords && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <BarChart3 size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Статистика</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Всего записей:</span>
              <span className="ml-2 font-semibold">{statistics.totalRecords}</span>
            </div>
            <div>
              <span className="text-gray-500">Групп:</span>
              <span className="ml-2 font-semibold">{statistics.totalGroups}</span>
            </div>
            <div>
              <span className="text-gray-500">Самая большая:</span>
              <span className="ml-2 font-semibold">
                {getGroupDisplayName(statistics.largestGroup.name)} ({statistics.largestGroup.size})
              </span>
            </div>
            <div>
              <span className="text-gray-500">Самая маленькая:</span>
              <span className="ml-2 font-semibold">
                {getGroupDisplayName(statistics.smallestGroup.name)} ({statistics.smallestGroup.size})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grouped Records */}
      {hasRecords ? (
        <div className="space-y-4">
          {Object.entries(groupedRecords).map(([groupName, groupRecords]) => {
            const isCollapsed = collapsedGroups.has(groupName);
            const groupColor = getGroupColor ? getGroupColor(groupName) : getDefaultGroupColor(groupName);
            const groupIcon = getGroupIcon ? getGroupIcon(groupName) : null;

            return (
              <div key={groupName} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Group Header */}
                <div
                  className={`px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                    allowGroupToggle ? '' : 'cursor-default'
                  }`}
                  onClick={() => allowGroupToggle && toggleGroup(groupName)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {allowGroupToggle && (
                        <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                          {isCollapsed ? (
                            <ChevronRight size={16} className="text-gray-500" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-500" />
                          )}
                        </button>
                      )}
                      
                      {groupIcon && <div className="flex-shrink-0">{groupIcon}</div>}
                      
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getGroupDisplayName(groupName)}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${groupColor}`}>
                          {groupRecords.length}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {Math.round((groupRecords.length / statistics.totalRecords) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Group Content */}
                {!isCollapsed && (
                  <div className="p-4">
                    {groupRecords.length > 0 ? (
                      <div className="space-y-3">
                        {groupRecords.map((record, index) => (
                          <div key={index} className="border-l-4 border-gray-200 pl-4">
                            {renderRecord(record, index)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>В этой группе нет записей</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Filter size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Ничего не найдено' : 'Нет данных'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `По запросу "${searchTerm}" записи не найдены`
              : emptyMessage
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
            >
              Очистить поиск
            </button>
          )}
        </div>
      )}
    </div>
  );
}
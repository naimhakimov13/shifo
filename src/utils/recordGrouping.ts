/**
 * Utility functions for grouping records by various criteria
 */

export interface GroupedRecords<T> {
  [key: string]: T[];
}

export interface GroupConfig {
  sortBy?: 'alphabetical' | 'count' | 'custom';
  sortOrder?: 'asc' | 'desc';
  customOrder?: string[];
  showEmptyGroups?: boolean;
}

/**
 * Groups records by a specified field
 */
export function groupRecordsByField<T>(
  records: T[],
  fieldName: keyof T,
  config: GroupConfig = {}
): GroupedRecords<T> {
  const {
    sortBy = 'alphabetical',
    sortOrder = 'asc',
    customOrder = [],
    showEmptyGroups = false
  } = config;

  // Group records by the specified field
  const grouped = records.reduce((groups, record) => {
    const fieldValue = record[fieldName];
    const key = fieldValue ? String(fieldValue) : 'Не указано';
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(record);
    
    return groups;
  }, {} as GroupedRecords<T>);

  // Add empty groups if specified
  if (showEmptyGroups && customOrder.length > 0) {
    customOrder.forEach(status => {
      if (!grouped[status]) {
        grouped[status] = [];
      }
    });
  }

  // Sort groups based on configuration
  const sortedEntries = Object.entries(grouped).sort(([keyA, recordsA], [keyB, recordsB]) => {
    let comparison = 0;

    switch (sortBy) {
      case 'count':
        comparison = recordsB.length - recordsA.length;
        break;
      case 'custom':
        const indexA = customOrder.indexOf(keyA);
        const indexB = customOrder.indexOf(keyB);
        if (indexA !== -1 && indexB !== -1) {
          comparison = indexA - indexB;
        } else if (indexA !== -1) {
          comparison = -1;
        } else if (indexB !== -1) {
          comparison = 1;
        } else {
          comparison = keyA.localeCompare(keyB);
        }
        break;
      default: // alphabetical
        comparison = keyA.localeCompare(keyB);
        break;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return Object.fromEntries(sortedEntries);
}

/**
 * Gets statistics for grouped records
 */
export function getGroupStatistics<T>(grouped: GroupedRecords<T>) {
  const stats = {
    totalGroups: Object.keys(grouped).length,
    totalRecords: Object.values(grouped).reduce((sum, records) => sum + records.length, 0),
    groupSizes: {} as Record<string, number>,
    largestGroup: { name: '', size: 0 },
    smallestGroup: { name: '', size: Infinity }
  };

  Object.entries(grouped).forEach(([groupName, records]) => {
    const size = records.length;
    stats.groupSizes[groupName] = size;

    if (size > stats.largestGroup.size) {
      stats.largestGroup = { name: groupName, size };
    }

    if (size < stats.smallestGroup.size && size > 0) {
      stats.smallestGroup = { name: groupName, size };
    }
  });

  if (stats.smallestGroup.size === Infinity) {
    stats.smallestGroup = { name: '', size: 0 };
  }

  return stats;
}

/**
 * Filters grouped records based on search criteria
 */
export function filterGroupedRecords<T>(
  grouped: GroupedRecords<T>,
  searchTerm: string,
  searchFields: (keyof T)[]
): GroupedRecords<T> {
  if (!searchTerm.trim()) {
    return grouped;
  }

  const filtered: GroupedRecords<T> = {};
  const lowerSearchTerm = searchTerm.toLowerCase();

  Object.entries(grouped).forEach(([groupName, records]) => {
    const filteredRecords = records.filter(record => {
      return searchFields.some(field => {
        const fieldValue = record[field];
        return fieldValue && String(fieldValue).toLowerCase().includes(lowerSearchTerm);
      });
    });

    if (filteredRecords.length > 0) {
      filtered[groupName] = filteredRecords;
    }
  });

  return filtered;
}

/**
 * Predefined status orders for different record types
 */
export const STATUS_ORDERS = {
  appointments: ['scheduled', 'completed', 'cancelled', 'no-show'],
  payments: ['pending', 'paid', 'failed', 'refunded'],
  patients: ['active', 'inactive', 'archived']
};

/**
 * Status display names in Russian
 */
export const STATUS_LABELS = {
  // Appointments
  scheduled: 'Запланировано',
  completed: 'Завершено',
  cancelled: 'Отменено',
  'no-show': 'Неявка',
  
  // Payments
  pending: 'Ожидает оплаты',
  paid: 'Оплачено',
  failed: 'Неуспешно',
  refunded: 'Возврат',
  
  // General
  active: 'Активные',
  inactive: 'Неактивные',
  archived: 'Архивные',
  'Не указано': 'Не указано'
};
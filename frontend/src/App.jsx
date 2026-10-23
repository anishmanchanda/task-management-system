import { useCallback, useEffect, useState } from 'react';
import { taskApi } from './api/tasks.js';
import { useDebounce } from './hooks/useDebounce.js';
import { useTasks } from './hooks/useTasks.js';
import { useTheme } from './hooks/useTheme.js';
import Toolbar from './components/Toolbar.jsx';
import TaskList from './components/TaskList.jsx';
import Pagination from './components/Pagination.jsx';
import Modal from './components/Modal.jsx';
import TaskForm from './components/TaskForm.jsx';
import TaskDetails from './components/TaskDetails.jsx';
import ConfirmDelete from './components/ConfirmDelete.jsx';
import Toast from './components/Toast.jsx';

const PAGE_SIZE = 6;
const DEFAULT_FILTERS = { search: '', status: '', priority: '', sort: 'createdAt:desc' };

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { type: 'create' | 'view' | 'edit' | 'delete', task? }
  const [toast, setToast] = useState(null);

  const search = useDebounce(filters.search.trim(), 300);
  const [sortBy, order] = filters.sort.split(':');
  const { tasks, meta, loading, error, reload } = useTasks({
    search,
    status: filters.status,
    priority: filters.priority,
    sortBy,
    order,
    page,
    limit: PAGE_SIZE,
  });

  // After a delete or filter change the current page may no longer exist.
  useEffect(() => {
    if (meta && page > meta.totalPages) setPage(meta.totalPages);
  }, [meta, page]);

  const hasFilters = Boolean(filters.search || filters.status || filters.priority);
  const updateFilters = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };
  const clearFilters = () => updateFilters(DEFAULT_FILTERS);

  const closeModal = () => setModal(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const afterChange = (message) => {
    closeModal();
    setToast({ id: Date.now(), message });
    reload();
  };

  const open = (type) => (task) => setModal({ type, task });
  const handlers = { onView: open('view'), onEdit: open('edit'), onDelete: open('delete') };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Task Manager</h1>
          <p className="muted">{meta ? `${meta.total}${hasFilters ? ' matching' : ''} task${meta.total === 1 ? '' : 's'}` : ' '}</p>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="icon-btn theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setModal({ type: 'create' })}>
            + New task
          </button>
        </div>
      </header>

      <main>
        <Toolbar filters={filters} hasFilters={hasFilters} onChange={updateFilters} onReset={clearFilters} />
        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          hasFilters={hasFilters}
          onRetry={reload}
          onCreate={() => setModal({ type: 'create' })}
          onClearFilters={clearFilters}
          {...handlers}
        />
        {!error && <Pagination meta={meta} onPageChange={setPage} />}
      </main>

      {modal?.type === 'create' && (
        <Modal title="New task" onClose={closeModal}>
          <TaskForm
            submitLabel="Create task"
            onCancel={closeModal}
            onSubmit={async (values) => {
              await taskApi.create(values);
              afterChange('Task created');
            }}
          />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Edit task" onClose={closeModal}>
          <TaskForm
            task={modal.task}
            submitLabel="Save changes"
            onCancel={closeModal}
            onSubmit={async (values) => {
              await taskApi.update(modal.task.id, values);
              afterChange('Task updated');
            }}
          />
        </Modal>
      )}
      {modal?.type === 'view' && (
        <Modal title="Task details" onClose={closeModal}>
          <TaskDetails taskId={modal.task.id} {...handlers} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <Modal title="Delete task" onClose={closeModal}>
          <ConfirmDelete
            task={modal.task}
            onCancel={closeModal}
            onConfirm={async () => {
              await taskApi.remove(modal.task.id);
              afterChange('Task deleted');
            }}
          />
        </Modal>
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}

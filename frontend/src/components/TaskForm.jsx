import { useState } from 'react';
import { PRIORITY_OPTIONS, STATUS_OPTIONS, validateTask } from '../utils/task.js';

const EMPTY = { title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' };

function Field({ name, label, error, children }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {children}
      {error && (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default function TaskForm({ task, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(() =>
    task
      ? { title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.dueDate ?? '' }
      : EMPTY,
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _, ...rest }) => rest);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const found = validateTask(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) return form.elements[firstInvalid].focus();

    setSubmitting(true);
    setFormError('');
    try {
      await onSubmit({
        ...values,
        title: values.title.trim(),
        description: values.description.trim(),
        dueDate: values.dueDate || null,
      });
    } catch (err) {
      // Surface server-side validation next to the matching fields.
      setErrors(Object.fromEntries(err.details?.map((d) => [d.field, d.message]) ?? []));
      setFormError(err.message);
      setSubmitting(false);
    }
  }

  const inputProps = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}
      <Field name="title" label="Title *" error={errors.title}>
        <input {...inputProps('title')} type="text" maxLength={100} required autoFocus placeholder="What needs doing?" />
      </Field>
      <Field name="description" label="Description *" error={errors.description}>
        <textarea {...inputProps('description')} rows={4} maxLength={1000} required placeholder="Add some detail" />
      </Field>
      <div className="field-row">
        <Field name="status" label="Status">
          <select {...inputProps('status')}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field name="priority" label="Priority">
          <select {...inputProps('priority')}>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field name="dueDate" label="Due date" error={errors.dueDate}>
          <input {...inputProps('dueDate')} type="date" />
        </Field>
      </div>
      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

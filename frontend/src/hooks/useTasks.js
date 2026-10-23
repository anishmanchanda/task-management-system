import { useCallback, useEffect, useState } from 'react';
import { taskApi } from '../api/tasks.js';

// Fetches a page of tasks whenever the query changes. Stale requests are aborted,
// so a slow response for an old search can never overwrite a newer one.
export function useTasks(params) {
  const [state, setState] = useState({ tasks: [], meta: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const key = JSON.stringify(params);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    taskApi
      .list(JSON.parse(key), controller.signal)
      .then(({ data, meta }) => setState({ tasks: data, meta, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState((s) => ({ ...s, loading: false, error }));
      });
    return () => controller.abort();
  }, [key, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  return { ...state, reload };
}

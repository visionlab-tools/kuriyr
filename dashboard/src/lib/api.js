const BASE_URL = window.location.origin;
export async function fetchLogs(params = {}) {
    const query = new URLSearchParams();
    if (params.page)
        query.set('page', String(params.page));
    if (params.limit)
        query.set('limit', String(params.limit));
    if (params.template)
        query.set('template', params.template);
    if (params.status)
        query.set('status', params.status);
    const res = await fetch(`${BASE_URL}/logs?${query}`);
    return res.json();
}
export async function fetchLog(id) {
    const res = await fetch(`${BASE_URL}/logs/${id}`);
    return res.json();
}

import { useEffect, useState } from 'react'

const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Header({ onRefresh }) {
  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gradient-to-tr from-blue-600 to-indigo-500" />
          <span className="font-semibold text-gray-800">Community</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/test" className="text-sm text-gray-600 hover:text-gray-900">System Test</a>
          <button onClick={onRefresh} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded">Refresh</button>
        </div>
      </div>
    </header>
  )
}

function CreateCard({ title, children, onSubmit, submitText }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      <form onSubmit={onSubmit} className="space-y-3">{children}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded">{submitText}</button>
      </form>
    </div>
  )
}

function App() {
  const [posts, setPosts] = useState([])
  const [events, setEvents] = useState([])
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [p, e, n] = await Promise.all([
        fetch(`${backend}/api/posts`).then(r => r.json()),
        fetch(`${backend}/api/events`).then(r => r.json()),
        fetch(`${backend}/api/notifications`).then(r => r.json()),
      ])
      setPosts(p)
      setEvents(e)
      setNotifs(n)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleCreatePost = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload = {
      author: fd.get('author') || 'anonymous',
      title: fd.get('title'),
      content: fd.get('content'),
      tags: (fd.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean),
      image_url: fd.get('image_url') || null,
    }
    await fetch(`${backend}/api/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    e.currentTarget.reset()
    fetchAll()
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const payload = {
      organizer: fd.get('organizer') || 'community',
      title: fd.get('title'),
      description: fd.get('description'),
      location: fd.get('location'),
      start_time: new Date(fd.get('start_time')).toISOString(),
      end_time: fd.get('end_time') ? new Date(fd.get('end_time')).toISOString() : null,
    }
    await fetch(`${backend}/api/events`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    e.currentTarget.reset()
    fetchAll()
  }

  const markRead = async (id) => {
    await fetch(`${backend}/api/notifications/read`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    fetchAll()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Header onRefresh={fetchAll} />
      <main className="max-w-5xl mx-auto p-4 grid md:grid-cols-3 gap-4">
        <section className="md:col-span-2 space-y-4">
          <CreateCard title="Create a Post" onSubmit={handleCreatePost} submitText="Publish">
            <input name="author" placeholder="Your name" className="w-full border rounded px-3 py-2" />
            <input name="title" placeholder="Post title" required className="w-full border rounded px-3 py-2" />
            <textarea name="content" placeholder="Write something..." required className="w-full border rounded px-3 py-2" />
            <input name="tags" placeholder="tags, comma,separated" className="w-full border rounded px-3 py-2" />
            <input name="image_url" placeholder="Image URL (optional)" className="w-full border rounded px-3 py-2" />
          </CreateCard>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Latest Posts</h3>
            {loading ? <p className="text-sm text-gray-500">Loading...</p> : (
              <div className="space-y-3">
                {posts.length === 0 && <p className="text-sm text-gray-500">No posts yet.</p>}
                {posts.map(p => (
                  <div key={p._id} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{p.title}</h4>
                      <span className="text-xs text-gray-500">by {p.author}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{p.content}</p>
                    {p.tags?.length ? <div className="mt-2 flex flex-wrap gap-2">{p.tags.map(t => <span key={t} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">#{t}</span>)}</div> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <CreateCard title="Create an Event" onSubmit={handleCreateEvent} submitText="Create Event">
            <input name="organizer" placeholder="Organizer" className="w-full border rounded px-3 py-2" />
            <input name="title" placeholder="Event title" required className="w-full border rounded px-3 py-2" />
            <textarea name="description" placeholder="Description" required className="w-full border rounded px-3 py-2" />
            <input name="location" placeholder="Location" required className="w-full border rounded px-3 py-2" />
            <label className="block text-sm text-gray-600">Start</label>
            <input type="datetime-local" name="start_time" required className="w-full border rounded px-3 py-2" />
            <label className="block text-sm text-gray-600">End (optional)</label>
            <input type="datetime-local" name="end_time" className="w-full border rounded px-3 py-2" />
          </CreateCard>

          <div className="bg-white rounded-xl shadow-sm border p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Notifications</h3>
            {loading ? <p className="text-sm text-gray-500">Loading...</p> : (
              <div className="space-y-2">
                {notifs.length === 0 && <p className="text-sm text-gray-500">No notifications yet.</p>}
                {notifs.map(n => (
                  <div key={n._id} className="border rounded p-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm"><span className="font-medium capitalize">{n.type}</span>: {n.message}</p>
                      {n.is_read ? <span className="text-xs text-gray-400">read</span> : <span className="text-xs text-blue-600">unread</span>}
                    </div>
                    {!n.is_read && <button onClick={() => markRead(n._id)} className="text-xs bg-gray-800 text-white px-2 py-1 rounded">Mark read</button>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App


import { useEffect, useState } from 'react'
import './App.css'

function Groups({ onSelectGroup, userName }) {
  const [groups, setGroups] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMembers, setSelectedMembers] = useState(null)
  const [members, setMembers] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  // Always use the logged-in user's name.
  const memberName = userName || ''

  // Load all study groups.
  async function loadGroups() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'http://localhost:8080/api/groups'
      )

      if (!response.ok) {
        throw new Error('Failed to load groups.')
      }

      const data = await response.json()
      setGroups(data)
    } catch (err) {
      console.error('Groups loading error:', err)
      setError('Failed to load groups. Please check the backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGroups()
  }, [])

  // Create a new study group.
  async function createGroup(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    const name = groupName.trim()
    const details = description.trim()

    if (!name) {
      setError('Please enter a group name.')
      return
    }

    try {
      const response = await fetch(
        'http://localhost:8080/api/groups',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            description: details
          })
        }
      )

      if (!response.ok) {
        throw new Error('Group creation failed.')
      }

      const newGroup = await response.json()

      setGroups(previous => [...previous, newGroup])
      setGroupName('')
      setDescription('')
      setShowForm(false)
      setNotice('Group created successfully!')
    } catch (err) {
      console.error('Create group error:', err)
      setError('Group creation failed. Please try again.')
    }
  }

  // Join a group using the logged-in user's name.
  async function joinGroup(group) {
    const name = memberName.trim()

    if (!name) {
      setError('Please log in before joining a group.')
      setNotice('')
      return
    }

    setError('')
    setNotice('')

    try {
      const response = await fetch(
        'http://localhost:8080/api/group-members',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            groupId: group.id,
            memberName: name
          })
        }
      )

      if (response.ok) {
        setNotice(`${name} joined ${group.name}!`)
        await viewMembers(group, false)
        return
      }

      // Check whether this user has already joined.
      const membersResponse = await fetch(
        `http://localhost:8080/api/group-members/${group.id}`
      )

      if (membersResponse.ok) {
        const existingMembers = await membersResponse.json()

        const alreadyJoined = existingMembers.some(
          member =>
            member.memberName?.trim().toLowerCase() ===
            name.toLowerCase()
        )

        if (alreadyJoined) {
          setMembers(existingMembers)
          setSelectedMembers(group)
          setNotice('You have already joined this group.')
          return
        }
      }

      console.error('Join group failed:', response.status)
      setError('Failed to join the group. Please try again.')
    } catch (err) {
      console.error('Join group error:', err)
      setError(
        'Failed to join the group. Please check the backend connection.'
      )
    }
  }

  // Load the members of a group.
  async function viewMembers(group, clearMessages = true) {
    if (clearMessages) {
      setError('')
      setNotice('')
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/group-members/${group.id}`
      )

      if (!response.ok) {
        throw new Error('Failed to load members.')
      }

      const data = await response.json()
      setMembers(data)
      setSelectedMembers(group)
    } catch (err) {
      console.error('Members loading error:', err)
      setError('Failed to load members.')
    }
  }

  // Open the chat only for a logged-in user.
  function openGroupChat(group) {
    if (!memberName.trim()) {
      setError('Please log in before opening the chat.')
      setNotice('')
      return
    }

    onSelectGroup(group)
  }

  return (
    <div className="groups">
      <h1>Explore Study Groups</h1>

      <label>
        Your member name:
        <input
          type="text"
          value={memberName}
          readOnly
          placeholder="Please log in first"
          maxLength={100}
        />
      </label>

      <div>
        <button
          type="button"
          onClick={() => {
            setShowForm(previous => !previous)
            setError('')
            setNotice('')
          }}
        >
          + Create New Group
        </button>
      </div>

      {showForm && (
        <form onSubmit={createGroup}>
          <h3>Create Your Group</h3>

          <input
            type="text"
            value={groupName}
            onChange={event => setGroupName(event.target.value)}
            placeholder="Enter group name"
            maxLength={100}
            required
          />

          <input
            type="text"
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="Enter group description"
            maxLength={255}
          />

          <button type="submit">Create Group</button>

          <button
            type="button"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </form>
      )}

      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}

      {loading ? (
        <p>Loading study groups...</p>
      ) : (
        <div className="group-container">
          {groups.length === 0 ? (
            <p>No study groups available.</p>
          ) : (
            groups.map(group => (
              <div className="group-card" key={group.id}>
                <h3>{group.name}</h3>
                <p>{group.description}</p>

                <button
                  type="button"
                  onClick={() => joinGroup(group)}
                >
                  Join Group
                </button>

                <button
                  type="button"
                  onClick={() => viewMembers(group)}
                >
                  View Members
                </button>

                <button
                  type="button"
                  onClick={() => openGroupChat(group)}
                >
                  Open Chat
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {selectedMembers && (
        <section>
          <h2>{selectedMembers.name} — Members</h2>

          {members.length === 0 ? (
            <p>No members have joined yet.</p>
          ) : (
            <ul>
              {members.map(member => (
                <li key={member.id}>
                  {member.memberName}
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => setSelectedMembers(null)}
          >
            Close Members
          </button>
        </section>
      )}
    </div>
  )
}

export default Groups

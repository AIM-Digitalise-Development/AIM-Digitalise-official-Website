import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const INITIAL_TASKS = [
  {
    id: 'TSK-1001',
    task: 'Verify Greenwood Public School annual subscription contract and AMC signature',
    status: 'Pending',
    priority: 'High',
    assignee: 'Rohan Verma',
    dueDate: '2026-06-18',
    createdBy: 'Admin',
    description: 'We need to collect the physically signed AMC contract and check the renewal dates before submitting the final invoice.'
  },
  {
    id: 'TSK-1002',
    task: 'Investigate and resolve SSL handshake failure on custom domain for Blue Hill Institute',
    status: 'In Progress',
    priority: 'Medium',
    assignee: 'Aman Gupta',
    dueDate: '2026-06-19',
    createdBy: 'Admin',
    description: 'The DNS settings point to our Cloudflare DNS but client receives SSL_ERROR_BAD_CERT_DOMAIN. Check the edge certificates configuration.'
  },
  {
    id: 'TSK-1003',
    task: 'Optimize invoice PDF generation query to support datasets with >50 items',
    status: 'Pending',
    priority: 'High',
    assignee: 'Neha Sharma',
    dueDate: '2026-06-16',
    createdBy: 'Rohan Verma',
    description: 'PDF generator times out after 30 seconds for large schools. We need to implement streaming or chunked data fetching.'
  },
  {
    id: 'TSK-1004',
    task: 'Publish updated Android build for St. Xavier High School with new branding assets',
    status: 'Completed',
    priority: 'Low',
    assignee: 'Vikram Malhotra',
    dueDate: '2026-06-14',
    createdBy: 'Admin',
    description: 'Build uploaded to play console, pending review. Notify the school principal once live.'
  }
]

export const useTaskStore = create(
  persist(
    (set) => ({
      tasks: INITIAL_TASKS,

      addTask: (taskData) => set((state) => {
        const newTask = {
          id: `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
          task: taskData.task,
          description: taskData.description || '',
          priority: taskData.priority || 'Medium',
          status: taskData.status || 'Pending',
          assignee: taskData.assignee || 'Unassigned',
          dueDate: taskData.dueDate || 'Today',
          createdBy: taskData.createdBy || 'Admin'
        }
        return { tasks: [newTask, ...state.tasks] }
      }),

      updateTaskStatus: (id, status) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, status } : t)
      })),

      assignTask: (id, assignee) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, assignee } : t)
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      }))
    }),
    { name: 'aim-task-storage' }
  )
)

'use client';

import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Task, TaskLog } from '../types';

export function useTaskManager() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [taskLogs, setTaskLogs] = useLocalStorage<TaskLog[]>('taskLogs', []);

  const addTask = useCallback((title: string, description?: string, options?: Partial<Task>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
      createdAt: Date.now(),
      tags: options?.tags,
      dueAt: options?.dueAt,
      color: options?.color,
    };

    setTasks((prev: Task[]) => [newTask, ...prev]);

    const log: TaskLog = {
      id: crypto.randomUUID(),
      taskId: newTask.id,
      action: 'created',
      timestamp: Date.now(),
      details: `Task "${title}" created`,
    };
    setTaskLogs((prev: TaskLog[]) => [log, ...prev]);

    return newTask;
  }, [setTasks, setTaskLogs]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev: Task[]) => 
      prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );

    const log: TaskLog = {
      id: crypto.randomUUID(),
      taskId: id,
      action: 'updated',
      timestamp: Date.now(),
      details: `Task updated`,
    };
    setTaskLogs((prev: TaskLog[]) => [log, ...prev]);
  }, [setTasks, setTaskLogs]);

  const completeTask = useCallback((id: string, duration?: number) => {
    setTasks((prev: Task[]) => 
      prev.map(task => 
        task.id === id 
          ? { ...task, completed: true, completedAt: Date.now(), duration } 
          : task
      )
    );

    const task = tasks.find(t => t.id === id);
    const log: TaskLog = {
      id: crypto.randomUUID(),
      taskId: id,
      action: 'completed',
      timestamp: Date.now(),
      details: `Task "${task?.title}" completed${duration ? ` in ${Math.floor(duration / 60)} minutes` : ''}`,
    };
    setTaskLogs((prev: TaskLog[]) => [log, ...prev]);
  }, [tasks, setTasks, setTaskLogs]);

  const deleteTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    setTasks((prev: Task[]) => prev.filter(task => task.id !== id));

    const log: TaskLog = {
      id: crypto.randomUUID(),
      taskId: id,
      action: 'deleted',
      timestamp: Date.now(),
      details: `Task "${task?.title}" deleted`,
    };
    setTaskLogs((prev: TaskLog[]) => [log, ...prev]);
  }, [tasks, setTasks, setTaskLogs]);

  const getTasksByStatus = useCallback((completed: boolean) => {
    return tasks.filter(task => task.completed === completed);
  }, [tasks]);

  const getTaskById = useCallback((id: string) => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  return {
    tasks,
    taskLogs,
    addTask,
    updateTask,
    completeTask,
    deleteTask,
    getTasksByStatus,
    getTaskById,
  };
}

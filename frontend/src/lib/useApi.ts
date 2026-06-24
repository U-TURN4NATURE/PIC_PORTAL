"use client";

import useSWR from 'swr';
import { fetcher } from './api';

export function useApi<T>(url: string | null) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, {
    revalidateOnFocus: false, // Don't spam the server on window focus
    dedupingInterval: 5000,   // Prevent duplicate requests within 5 seconds
  });

  return {
    data,
    isLoading,
    error: error?.response?.data?.message || error?.message || (error ? 'An error occurred' : null),
    refetch: mutate,
  };
}

const rawApiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim() ?? '';
const normalizedApiBaseUrl = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '')
  : 'https://api.saha-yak.in';
const API_BASE_URL = `${normalizedApiBaseUrl}/api`;

export interface ServiceCategory {
  id: number;
  name: string;
  icon: string;
  items: string[];
}

export interface ServiceItem {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
}

export interface AreaCoordinate {
  id: number;
  areaName: string;
  pinCode: string;
  latitude: number;
  longitude: number;
}

export interface ServiceRequest {
  id: number;
  referenceId: string;
  name: string;
  phone: string;
  floor: string;
  building: string;
  street: string;
  area: string;
  city: string;
  pinCode: string;
  landmark: string;
  latitude?: number;
  longitude?: number;
  category: string;
  selectedServices: string[];
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  status: string;
  submittedAt: string;
  updatedAt: string;
}

export interface CreateServiceRequestDTO {
  name: string;
  phone: string;
  floor: string;
  building: string;
  street: string;
  area: string;
  city: string;
  pinCode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  category: string;
  selectedServices: string[];
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
}

export interface ServiceLog {
  id: number;
  personName: string;
  taskDescription: string;
  serviceType: string;
  createdAt: string;
}

export interface AdminStats {
  totalRequests: number;
  newRequests: number;
  contactedRequests: number;
  completedRequests: number;
}

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<ServiceCategory[]> => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const json = await response.json();
    if (Array.isArray(json)) return json;
    return (json && (json.data || json.categories || json.items)) ?? [];
  },

  getById: async (id: number): Promise<ServiceCategory> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    if (!response.ok) throw new Error('Failed to fetch category');
    return response.json();
  }
};

export const serviceItemsAPI = {
  getAll: async (search?: string, categoryId?: number): Promise<ServiceItem[]> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId.toString());

    const url = `${API_BASE_URL}/serviceitems${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch service items');
    return response.json();
  },

  getByCategoryId: async (categoryId: number): Promise<ServiceItem[]> => {
    const response = await fetch(`${API_BASE_URL}/serviceitems/category/${categoryId}`);
    if (!response.ok) throw new Error('Failed to fetch service items for category');
    return response.json();
  }
};

// Areas API
export const areasAPI = {
  getAll: async (): Promise<AreaCoordinate[]> => {
    const response = await fetch(`${API_BASE_URL}/areas`);
    if (!response.ok) throw new Error('Failed to fetch areas');
    const json = await response.json();
    if (Array.isArray(json)) return json;
    return (json && (json.data || json.areas)) ?? [];
  },

  getById: async (id: number): Promise<AreaCoordinate> => {
    const response = await fetch(`${API_BASE_URL}/areas/${id}`);
    if (!response.ok) throw new Error('Failed to fetch area');
    return response.json();
  }
};

// Requests API
export const requestsAPI = {
  create: async (data: CreateServiceRequestDTO): Promise<ServiceRequest> => {
    const response = await fetch(`${API_BASE_URL}/requests/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create request');
    return response.json();
  },

  getById: async (id: number): Promise<ServiceRequest> => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}`);
    if (!response.ok) throw new Error('Failed to fetch request');
    return response.json();
  },

  getByReference: async (referenceId: string): Promise<ServiceRequest> => {
    const response = await fetch(`${API_BASE_URL}/requests/reference/${referenceId}`);
    if (!response.ok) throw new Error('Failed to fetch request');
    return response.json();
  },

  getAll: async (status?: string, search?: string): Promise<ServiceRequest[]> => {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE_URL}/requests/all?${params}`);
    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  },

  updateStatus: async (id: number, status: string): Promise<ServiceRequest> => {
    const response = await fetch(`${API_BASE_URL}/requests/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await fetch(`${API_BASE_URL}/requests/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }
};

// Logs API
export const logsAPI = {
  getRecent: async (count: number = 6): Promise<ServiceLog[]> => {
    const response = await fetch(`${API_BASE_URL}/logs/recent?count=${count}`);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  }
};

// Admin API
export const adminAPI = {
  login: async (password: string): Promise<{ success: boolean; message: string; token?: string }> => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    return response.json();
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`);
    if (!response.ok) throw new Error('Failed to fetch admin stats');
    return response.json();
  }
};

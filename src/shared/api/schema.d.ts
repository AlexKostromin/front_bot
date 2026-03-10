// Auto-generated from Swagger spec

export interface paths {
  '/api/admin/login': {
    post: {
      requestBody: {
        content: {
          'application/json': {
            username: string;
            password: string;
          };
        };
      };
      responses: {
        200: {
          content: {
            'application/json': {
              token: string;
            };
          };
        };
      };
    };
  };
  '/api/admin/stats': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': {
              bookings_today: number;
              bookings_total: number;
              users_total: number;
              confirmed_total: number;
              bookings_chart: Array<{ date: string; count: number }>;
            };
          };
        };
      };
    };
  };
  '/api/admin/users': {
    get: {
      parameters: {
        query: {
          page?: number;
          limit?: number;
          search?: string;
        };
      };
      responses: {
        200: {
          content: {
            'application/json': {
              items: Array<{
                id: number;
                full_name: string;
                phone: string;
                chat_id: number;
                class_number: number;
                class_group_id: number;
                group_name: string;
                is_active: boolean;
                created_at: string;
              }>;
              page: number;
              limit: number;
              total: number;
            };
          };
        };
      };
    };
  };
  '/api/admin/users/{id}': {
    get: {
      parameters: { path: { id: number } };
      responses: {
        200: {
          content: {
            'application/json': Record<string, unknown>;
          };
        };
      };
    };
    patch: {
      parameters: { path: { id: number } };
      requestBody: {
        content: {
          'application/json': {
            is_active: boolean;
          };
        };
      };
      responses: {
        200: {
          content: {
            'application/json': Record<string, unknown>;
          };
        };
      };
    };
  };
  '/api/admin/tutors': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': Array<{
              id: number;
              full_name: string;
              created_at: string;
            }>;
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          'application/json': Record<string, unknown>;
        };
      };
      responses: {
        200: {
          content: {
            'application/json': Record<string, unknown>;
          };
        };
      };
    };
  };
  '/api/admin/tutors/{id}': {
    get: {
      parameters: { path: { id: number } };
      responses: {
        200: { content: { 'application/json': Record<string, unknown> } };
      };
    };
    put: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': Record<string, unknown> } };
      responses: {
        200: { content: { 'application/json': Record<string, unknown> } };
      };
    };
    delete: {
      parameters: { path: { id: number } };
      responses: {
        200: { content: { 'application/json': Record<string, unknown> } };
      };
    };
  };
  '/api/admin/subjects': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': Array<{
              ID: number;
              Name: string;
            }>;
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          'application/json': Record<string, unknown>;
        };
      };
      responses: {
        200: { content: { 'application/json': Record<string, unknown> } };
      };
    };
  };
  '/api/admin/subjects/{id}': {
    put: {
      parameters: { path: { id: number } };
      requestBody: { content: { 'application/json': Record<string, unknown> } };
      responses: {
        200: { content: { 'application/json': Record<string, unknown> } };
      };
    };
    delete: {
      parameters: { path: { id: number } };
      responses: {
        200: { content: { 'application/json': Record<string, unknown> } };
      };
    };
  };
  '/api/admin/class-groups': {
    get: {
      responses: {
        200: {
          content: {
            'application/json': Array<{
              id: number;
              name: string;
            }>;
          };
        };
      };
    };
  };
  '/api/admin/slots': {
    get: {
      parameters: {
        query: {
          page?: number;
          limit?: number;
          date?: string;
          group_id?: number;
          available?: boolean;
        };
      };
      responses: {
        200: {
          content: {
            'application/json': {
              items: Array<{
                id: number;
                tutor_id: number;
                tutor_name: string;
                subject_id: number;
                subject_name: string;
                class_group_id: number;
                group_name: string;
                slot_date: string;
                start_time: string;
                end_time: string;
                is_available: boolean;
              }>;
              page: number;
              limit: number;
              total: number;
            };
          };
        };
      };
    };
    post: {
      requestBody: {
        content: {
          'application/json': {
            tutor_id: number;
            subject_id: number;
            class_group_id: number;
            slot_date: string;
            start_time: string;
            end_time: string;
          };
        };
      };
      responses: {
        201: {
          content: {
            'application/json': Record<string, unknown>;
          };
        };
      };
    };
  };
  '/api/admin/slots/{id}': {
    get: {
      parameters: { path: { id: number } };
      responses: {
        200: { content: { 'application/json': Record<string, unknown> } };
      };
    };
    put: {
      parameters: { path: { id: number } };
      requestBody: {
        content: {
          'application/json': {
            tutor_id: number;
            subject_id: number;
            class_group_id: number;
            slot_date: string;
            start_time: string;
            end_time: string;
          };
        };
      };
      responses: {
        200: { content: { 'application/json': Record<string, unknown> } };
      };
    };
    delete: {
      parameters: { path: { id: number } };
      responses: {
        200: { content: { 'application/json': Record<string, unknown> } };
      };
    };
  };
  '/api/admin/slots/bulk': {
    post: {
      requestBody: {
        content: {
          'application/json': Record<string, unknown>;
        };
      };
      responses: {
        200: { content: { 'application/json': Record<string, unknown> } };
      };
    };
  };
  '/api/admin/bookings': {
    get: {
      parameters: {
        query: {
          page?: number;
          limit?: number;
          status?: string;
          user_id?: number;
          date?: string;
        };
      };
      responses: {
        200: {
          content: {
            'application/json': {
              items: Array<{
                id: number;
                user_id: number;
                user_name: string;
                user_phone: string;
                slot_id: number;
                slot_date: string;
                start_time: string;
                end_time: string;
                subject_name: string;
                status: string;
                comment?: string;
                booked_at: string;
              }>;
              page: number;
              limit: number;
              total: number;
            };
          };
        };
      };
    };
  };
  '/api/admin/bookings/{id}': {
    get: {
      parameters: { path: { id: number } };
      responses: {
        200: { content: { 'application/json': Record<string, unknown> } };
      };
    };
  };
  '/api/admin/bookings/{id}/status': {
    patch: {
      parameters: { path: { id: number } };
      requestBody: {
        content: {
          'application/json': {
            status: string;
            comment?: string;
          };
        };
      };
      responses: {
        200: { content: { 'application/json': Record<string, unknown> } };
      };
    };
  };
}
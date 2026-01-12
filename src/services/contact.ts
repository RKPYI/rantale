import { apiClient } from "@/lib/api-client";
import {
  ContactRequest,
  ContactResponse,
  UserContactsResponse,
  UserContactResponse,
} from "@/types/api";

/**
 * Contact Service
 * Handles contact form submissions and user contact history
 */
export const contactService = {
  /**
   * Submit contact form (public - works for both guests and authenticated users)
   * @param data Contact form data
   * @returns Promise with success message
   */
  async submit(data: ContactRequest): Promise<ContactResponse> {
    const response = await apiClient.post<ContactResponse>("/contact", data);

    // Handle both wrapped and direct responses
    return response.data || (response as unknown as ContactResponse);
  },

  /**
   * Get user's contact history (authenticated users only)
   * @param page Page number
   * @param status Filter by status
   * @returns Promise with paginated contacts
   */
  async getMyContacts(
    page?: number,
    status?: string,
  ): Promise<UserContactsResponse> {
    const params: Record<string, string | number> = {};
    if (page) params.page = page;
    if (status && status !== "all") params.status = status;

    const response = await apiClient.get<UserContactsResponse>(
      "/my-contacts",
      params,
    );

    return response.data || (response as unknown as UserContactsResponse);
  },

  /**
   * Get specific contact message (authenticated users only - own contacts only)
   * @param contactId Contact ID
   * @returns Promise with contact details
   */
  async getMyContact(contactId: number): Promise<UserContactResponse> {
    const response = await apiClient.get<UserContactResponse>(
      `/my-contacts/${contactId}`,
    );

    return response.data || (response as unknown as UserContactResponse);
  },
};

import { apiClient } from "@/lib/api-client";
import {
  Volume,
  VolumeListResponse,
  VolumeSummary,
} from "@/types/api";

export interface CreateVolumeRequest {
  title: string;
  description?: string;
  volume_number?: number;
}

export interface UpdateVolumeRequest {
  title?: string;
  description?: string;
  volume_number?: number;
}

export const volumeService = {
  async getNovelVolumes(novelSlug: string): Promise<{
    uses_volumes: boolean;
    volumes: VolumeSummary[];
  }> {
    const response = await apiClient.get<VolumeListResponse>(
      `/novels/${novelSlug}/volumes`,
    );

    return {
      uses_volumes: response.data.uses_volumes,
      volumes: response.data.volumes,
    };
  },

  async getAuthorNovelVolumes(novelSlug: string): Promise<{
    uses_volumes: boolean;
    volumes: VolumeSummary[];
  }> {
    const response = await apiClient.get<VolumeListResponse>(
      `/author/novels/${novelSlug}/volumes`,
    );

    return {
      uses_volumes: response.data.uses_volumes,
      volumes: response.data.volumes,
    };
  },

  async createVolume(
    novelSlug: string,
    data: CreateVolumeRequest,
  ): Promise<Volume> {
    const response = await apiClient.post<{ message: string; volume: Volume }>(
      `/novels/${novelSlug}/volumes`,
      data,
    );
    return response.data.volume;
  },

  async updateVolume(
    novelSlug: string,
    volumeId: number,
    data: UpdateVolumeRequest,
  ): Promise<Volume> {
    const response = await apiClient.put<{ message: string; volume: Volume }>(
      `/novels/${novelSlug}/volumes/${volumeId}`,
      data,
    );
    return response.data.volume;
  },

  async deleteVolume(novelSlug: string, volumeId: number): Promise<void> {
    await apiClient.delete(`/novels/${novelSlug}/volumes/${volumeId}`);
  },
};

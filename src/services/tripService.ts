import {apiService} from '@/api';
import {Trip} from '@/types';

export const tripService = {
  async getTripById(tripId: string): Promise<Trip | null> {
    return apiService.getTripById(tripId);
  },
};

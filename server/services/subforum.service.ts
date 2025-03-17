import SubforumModel from '../models/subforums.model';
import { DatabaseSubforum, CreateSubforumRequest } from '@fake-stack-overflow/shared/types/types';

export const saveSubforum = async (
  newSubforum: CreateSubforumRequest,
): Promise<DatabaseSubforum> => {
  const subforum = new SubforumModel({
    ...newSubforum,
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    questionCount: 0,
  });
  return await subforum.save();
};

export const updateSubforumById = async (
  id: string,
  updateData: Partial<DatabaseSubforum>,
): Promise<DatabaseSubforum | null> => {
  return await SubforumModel.findByIdAndUpdate(id, updateData, { new: true });
};

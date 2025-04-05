import UserModel from '../models/users.model';

const applyKarmaDecay = async () => {
  try {
    await UserModel.updateMany({ karma: { $gt: 0 } }, { $inc: { karma: -1 } });
    return { success: true };
  } catch (error) {
    return { success: false, error: `Error applying karma decay: ${error}` };
  }
};

export default applyKarmaDecay;

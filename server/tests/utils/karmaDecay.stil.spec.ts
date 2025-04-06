import UserModel from '../../models/users.model';
import applyKarmaDecay from '../../utils/karmaDecay.util';

jest.mock('../../models/users.model');

describe('applyKarmaDecay', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should decrement karma for users with karma > 0', async () => {
    const mockUpdateMany = UserModel.updateMany as jest.Mock;
    mockUpdateMany.mockResolvedValueOnce({ acknowledged: true });

    const result = await applyKarmaDecay();

    expect(mockUpdateMany).toHaveBeenCalledWith({ karma: { $gt: 0 } }, { $inc: { karma: -1 } });
    expect(result).toEqual({ success: true });
  });

  it('should return error if updateMany throws', async () => {
    const mockUpdateMany = UserModel.updateMany as jest.Mock;
    mockUpdateMany.mockRejectedValueOnce(new Error('DB failure'));

    const result = await applyKarmaDecay();

    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('Error applying karma decay: Error: DB failure'),
    });
  });
});

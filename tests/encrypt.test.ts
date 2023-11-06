import encrypt from '../src/lib/encrypt';
import { kmsClient } from '../src/lib/utils/kms/kmsClient';
import { changeId } from '../src/lib/utils/tools/changeId';


jest.mock('../src/lib/utils/changeId', () => ({
  changeId: jest.fn(),
}));

jest.mock('../src/lib/utils/kmsClient', () => ({
  kmsClient: {
    encrypt: jest.fn(),
  },
}));

describe('encrypt function', () => {
  const keyName = 'google-oauth2|113378216876216346016';
  const safeId = 'google0oauth20113378216876216346016';
  const plaintext = Buffer.from('Encrypt this data please.')
  const ciphertext = ``;

  beforeEach(() => {
    (changeId as jest.Mock).mockReturnValue(safeId);
    (kmsClient.encrypt as jest.Mock).mockResolvedValue([{ ciphertext: Buffer.from(ciphertext) }]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('encrypts the plaintext successfully', async () => {
    const response = await encrypt(plaintext, keyName);

    expect(changeId).toHaveBeenCalledWith(keyName);
    expect(kmsClient.encrypt).toHaveBeenCalledWith({
      name: `projects/auth-custom-try/locations/global/keyRings/Canada-Dry/cryptoKeys/edkey`,
      plaintext: plaintext,
    });
    expect(response).toEqual({ data: ciphertext });
  });

  it('throws an error when encryption fails', async () => {
    (kmsClient.encrypt as jest.Mock).mockResolvedValue([{}]);

    await expect(encrypt(plaintext, keyName)).rejects.toThrow(
      'Encryption failed or returned null/undefined ciphertext'
    );
  });
});

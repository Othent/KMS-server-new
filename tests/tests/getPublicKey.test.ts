import getPublickey from '../../src/lib/getPublicKey'
import { keyName, savedPublickey } from '../testValues';


test('if getPublicKey() works', async () => {

    const callPublicKey = (await getPublickey(keyName)).data

    expect(callPublicKey).toEqual(savedPublickey);
});

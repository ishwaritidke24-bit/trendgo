import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/user.model.js';
import { Friendship } from '../models/friendship.model.js';
import { Notification } from '../models/notification.model.js';
import {
  listFriends,
  listFriendRequests,
  searchUsers,
  getFriendSuggestions,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getRelationshipStatus,
} from '../services/friend.service.js';

async function runTests() {
  await connectDatabase();
  console.log('--- STARTING FRIENDS SYSTEM INTEGRATION TESTS ---');

  // Find Tommy and seeded users
  const tommy = await User.findOne({ email: 'tommy123@gmail.com' });
  const aarav = await User.findOne({ email: 'aarav@trendgo.dev' });
  const priya = await User.findOne({ email: 'priya@trendgo.dev' });
  const rohan = await User.findOne({ email: 'rohan@trendgo.dev' });

  if (!tommy || !aarav || !priya || !rohan) {
    throw new Error('Required test users not found. Run seed-users first.');
  }

  console.log('✓ Found test users: Tommy, Aarav, Priya, Rohan');

  // Clean up any previous test friendships between these users
  const testUserIds = [tommy._id, aarav._id, priya._id, rohan._id];
  await Friendship.deleteMany({
    $or: [
      { requesterId: { $in: testUserIds }, addresseeId: { $in: testUserIds } },
    ],
  });
  await Notification.deleteMany({
    type: { $in: ['friend_request', 'friend_accept'] },
  });

  // TEST 1: Self relationship
  const selfStatus = await getRelationshipStatus(tommy._id, tommy._id);
  if (selfStatus.status !== 'SELF') throw new Error(`Test 1 Failed: Expected SELF, got ${selfStatus.status}`);
  console.log('✓ Test 1: Self relationship status is SELF');

  // TEST 2: Initial status between Tommy and Aarav
  const initialStatus = await getRelationshipStatus(tommy._id, aarav._id);
  if (initialStatus.status !== 'NOT_FRIENDS') throw new Error(`Test 2 Failed: Expected NOT_FRIENDS, got ${initialStatus.status}`);
  console.log('✓ Test 2: Initial status between Tommy & Aarav is NOT_FRIENDS');

  // TEST 3: User search
  const searchAarav = await searchUsers(tommy._id, 'Aarav');
  if (searchAarav.length === 0 || searchAarav[0].name !== 'Aarav Sharma') {
    throw new Error('Test 3 Failed: Search for Aarav did not return Aarav Sharma');
  }
  if (searchAarav[0].relationship !== 'NOT_FRIENDS') {
    throw new Error(`Test 3 Failed: Relationship in search should be NOT_FRIENDS, got ${searchAarav[0].relationship}`);
  }

  const searchSelf = await searchUsers(tommy._id, 'tommy');
  if (searchSelf.length > 0) throw new Error('Test 3 Failed: Self must never appear in search results');
  console.log('✓ Test 3: Search works accurately & excludes self');

  // TEST 4: Friend suggestions
  const suggestions = await getFriendSuggestions(tommy._id, 5);
  if (suggestions.length === 0) throw new Error('Test 4 Failed: Expected suggestions > 0');
  if (suggestions.some((s) => s.id === tommy._id.toString())) {
    throw new Error('Test 4 Failed: Suggestions should not include self');
  }
  console.log(`✓ Test 4: Friend suggestions returned ${suggestions.length} users`);

  // TEST 5: Prevent Self Request
  let selfRequestError = false;
  try {
    await sendFriendRequest(tommy._id, tommy._id);
  } catch (err) {
    selfRequestError = true;
  }
  if (!selfRequestError) throw new Error('Test 5 Failed: Sending request to self should fail');
  console.log('✓ Test 5: Cannot send friend request to self');

  // TEST 6: Send Friend Request Tommy -> Aarav
  const sendRes = await sendFriendRequest(tommy._id, aarav._id);
  if (sendRes.relationship !== 'REQUEST_SENT') {
    throw new Error(`Test 6 Failed: Expected REQUEST_SENT, got ${sendRes.relationship}`);
  }

  const tommyRelAarav = await getRelationshipStatus(tommy._id, aarav._id);
  const aaravRelTommy = await getRelationshipStatus(aarav._id, tommy._id);
  if (tommyRelAarav.status !== 'REQUEST_SENT') {
    throw new Error(`Test 6 Failed: Tommy status expected REQUEST_SENT, got ${tommyRelAarav.status}`);
  }
  if (aaravRelTommy.status !== 'REQUEST_RECEIVED') {
    throw new Error(`Test 6 Failed: Aarav status expected REQUEST_RECEIVED, got ${aaravRelTommy.status}`);
  }
  console.log('✓ Test 6: Friend request sent and relationship bidirectional statuses verified');

  // TEST 7: Duplicate Request Prevention
  let dupRequestError = false;
  try {
    await sendFriendRequest(tommy._id, aarav._id);
  } catch (err) {
    dupRequestError = true;
  }
  if (!dupRequestError) throw new Error('Test 7 Failed: Duplicate request should throw error');
  console.log('✓ Test 7: Duplicate friend request correctly prevented');

  // TEST 8: Check incoming/outgoing requests
  const aaravRequests = await listFriendRequests(aarav._id);
  if (aaravRequests.incoming.length !== 1 || aaravRequests.incoming[0].sender.id !== tommy._id.toString()) {
    throw new Error('Test 8 Failed: Aarav incoming requests mismatch');
  }

  const tommyRequests = await listFriendRequests(tommy._id);
  if (tommyRequests.outgoing.length !== 1 || tommyRequests.outgoing[0].recipient.id !== aarav._id.toString()) {
    throw new Error('Test 8 Failed: Tommy outgoing requests mismatch');
  }
  console.log('✓ Test 8: List requests verified for both sender and recipient');

  // TEST 9: Notification created for recipient
  const aaravNotifs = await Notification.find({ userId: aarav._id, type: 'friend_request' });
  if (aaravNotifs.length !== 1) throw new Error('Test 9 Failed: Aarav should have received 1 notification');
  console.log('✓ Test 9: Real in-app notification created for recipient');

  // TEST 10: Accept Friend Request
  const requestId = aaravRequests.incoming[0].id;
  const acceptRes = await acceptFriendRequest(aarav._id, requestId);
  if (acceptRes.relationship !== 'FRIENDS') {
    throw new Error(`Test 10 Failed: Expected FRIENDS, got ${acceptRes.relationship}`);
  }

  const tommyFriends = await listFriends(tommy._id);
  const aaravFriends = await listFriends(aarav._id);
  if (tommyFriends.length !== 1 || tommyFriends[0].id !== aarav._id.toString()) {
    throw new Error('Test 10 Failed: Tommy friends list mismatch after accept');
  }
  if (aaravFriends.length !== 1 || aaravFriends[0].id !== tommy._id.toString()) {
    throw new Error('Test 10 Failed: Aarav friends list mismatch after accept');
  }
  console.log('✓ Test 10: Accepted request creates mutual friendship for both users');

  // TEST 11: Notification created for requester on accept
  const tommyNotifs = await Notification.find({ userId: tommy._id, type: 'friend_accept' });
  if (tommyNotifs.length !== 1) throw new Error('Test 11 Failed: Tommy should receive friend_accept notification');
  console.log('✓ Test 11: Notification sent to requester when request is accepted');

  // TEST 12: Cancel Outgoing Request Flow (Tommy -> Priya)
  await sendFriendRequest(tommy._id, priya._id);
  const tommyOutgoing = await listFriendRequests(tommy._id);
  const priyaReqItem = tommyOutgoing.outgoing.find((r) => r.recipient.id === priya._id.toString());
  if (!priyaReqItem) throw new Error('Test 12 Failed: Outgoing request to Priya not found');
  const cancelRes = await cancelFriendRequest(tommy._id, priyaReqItem.id);
  if (cancelRes.relationship !== 'NOT_FRIENDS') {
    throw new Error(`Test 12 Failed: Expected NOT_FRIENDS after cancel, got ${cancelRes.relationship}`);
  }
  const priyaRel = await getRelationshipStatus(tommy._id, priya._id);
  if (priyaRel.status !== 'NOT_FRIENDS') {
    throw new Error(`Test 12 Failed: Status after cancel should be NOT_FRIENDS, got ${priyaRel.status}`);
  }
  console.log('✓ Test 12: Cancel outgoing friend request works and restores NOT_FRIENDS');

  // TEST 13: Reject Incoming Request Flow (Rohan -> Tommy)
  await sendFriendRequest(rohan._id, tommy._id);
  const tommyIncoming = await listFriendRequests(tommy._id);
  const rohanReqItem = tommyIncoming.incoming.find((r) => r.sender.id === rohan._id.toString());
  if (!rohanReqItem) throw new Error('Test 13 Failed: Incoming request from Rohan not found');
  const rejectRes = await rejectFriendRequest(tommy._id, rohanReqItem.id);
  if (rejectRes.relationship !== 'NOT_FRIENDS') {
    throw new Error(`Test 13 Failed: Expected NOT_FRIENDS after reject, got ${rejectRes.relationship}`);
  }
  const rohanRel = await getRelationshipStatus(tommy._id, rohan._id);
  if (rohanRel.status !== 'NOT_FRIENDS') {
    throw new Error(`Test 13 Failed: Status after reject should be NOT_FRIENDS, got ${rohanRel.status}`);
  }
  console.log('✓ Test 13: Reject incoming friend request works and restores NOT_FRIENDS');

  // TEST 14: Remove Friend Flow (Tommy removes Aarav)
  const removeRes = await removeFriend(tommy._id, aarav._id);
  if (!removeRes.success) throw new Error('Test 14 Failed: Remove friend did not succeed');
  const tommyFriendsAfter = await listFriends(tommy._id);
  const aaravFriendsAfter = await listFriends(aarav._id);
  if (tommyFriendsAfter.length !== 0) throw new Error('Test 14 Failed: Tommy should have 0 friends after removal');
  if (aaravFriendsAfter.length !== 0) throw new Error('Test 14 Failed: Aarav should have 0 friends after removal');
  console.log('✓ Test 14: Remove friend successfully removes mutual relationship');

  // Clean up notifications
  await Notification.deleteMany({
    type: { $in: ['friend_request', 'friend_accept'] },
  });

  console.log('\n========================================');
  console.log('🎉 ALL 14 TESTS PASSED CLEANLY & ACCURATELY!');
  console.log('========================================\n');
  await disconnectDatabase();
}

runTests().catch(async (err) => {
  console.error('\n❌ TEST FAILED:', err);
  try {
    await disconnectDatabase();
  } catch (e) {}
  process.exit(1);
});

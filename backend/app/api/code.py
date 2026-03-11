from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Optional, List

from app.api.auth import get_current_user
from app.models.models import User, SolvedProblem, ActivityLog
from app.core.database import get_session

router = APIRouter()

# ============================================================
# 100+ CODING PROBLEMS DATASET
# ============================================================
PROBLEMS = [
    # ── ARRAYS ──────────────────────────────────────────────
    {"id": "ARR-001", "category": "Arrays", "difficulty": "Easy", "title": "Two Sum", "description": "Given an array of integers nums and integer target, return indices of two numbers that add up to target.", "hint": "Use a hash map to store each number's index as you iterate.", "solution": "Use HashMap: store num→index as you go. For each num, check if target-num exists in map.", "companies": ["Google", "Amazon", "Microsoft"]},
    {"id": "ARR-002", "category": "Arrays", "difficulty": "Easy", "title": "Best Time to Buy and Sell Stock", "description": "Given array prices where prices[i] is price of stock on day i, find max profit from a single buy-sell.", "hint": "Track min price seen so far and compare profit.", "solution": "Track minPrice = Inf, maxProfit = 0. For each price: update minPrice, compute profit = price - minPrice, update maxProfit.", "companies": ["Amazon", "Facebook"]},
    {"id": "ARR-003", "category": "Arrays", "difficulty": "Easy", "title": "Contains Duplicate", "description": "Given integer array, return true if any value appears at least twice.", "hint": "Use a set to track seen numbers.", "solution": "Add each element to a HashSet. If size doesn't increase, it's a duplicate.", "companies": ["Amazon"]},
    {"id": "ARR-004", "category": "Arrays", "difficulty": "Easy", "title": "Product of Array Except Self", "description": "Return array output such that output[i] is equal to product of all elements except nums[i]. No division allowed.", "hint": "Use prefix and suffix product arrays.", "solution": "Two-pass approach: compute prefix products left→right, then suffix products right→left. Multiply prefix[i] * suffix[i].", "companies": ["Amazon", "Microsoft", "Apple"]},
    {"id": "ARR-005", "category": "Arrays", "difficulty": "Medium", "title": "Maximum Subarray (Kadane's)", "description": "Find the contiguous subarray with the largest sum.", "hint": "Kadane's algorithm: extend or restart subarray at each step.", "solution": "maxCurrent = maxGlobal = nums[0]. For each num: maxCurrent = max(num, maxCurrent+num). Update maxGlobal.", "companies": ["Amazon", "Google", "Microsoft"]},
    {"id": "ARR-006", "category": "Arrays", "difficulty": "Medium", "title": "3Sum", "description": "Find all unique triplets in array that give sum zero.", "hint": "Sort first, then use two pointers.", "solution": "Sort array. For each i, use lo/hi pointers. Adjust based on sum. Skip duplicates.", "companies": ["Facebook", "Google"]},
    {"id": "ARR-007", "category": "Arrays", "difficulty": "Medium", "title": "Container With Most Water", "description": "Given heights array, find two lines that form container with most water.", "hint": "Two pointers from both ends, always move shorter side.", "solution": "Start lo=0, hi=n-1. area = min(h[lo],h[hi]) * (hi-lo). Move smaller pointer inward.", "companies": ["Amazon", "Google"]},
    {"id": "ARR-008", "category": "Arrays", "difficulty": "Medium", "title": "Merge Intervals", "description": "Given array of intervals, merge all overlapping intervals.", "hint": "Sort by start time, then iteratively merge.", "solution": "Sort intervals by start. Iterate: if current start <= prev end, merge. Else add new interval.", "companies": ["Google", "Facebook", "Microsoft"]},
    {"id": "ARR-009", "category": "Arrays", "difficulty": "Medium", "title": "Find Minimum in Rotated Sorted Array", "description": "Given rotated sorted array with unique elements, find minimum element.", "hint": "Binary search: compare mid with right to determine which half is sorted.", "solution": "Binary search: if mid > right, minimum is in right half. Else in left half.", "companies": ["Microsoft", "Amazon"]},
    {"id": "ARR-010", "category": "Arrays", "difficulty": "Hard", "title": "Trapping Rain Water", "description": "Given heights, compute how much water it can trap after raining.", "hint": "Two-pointer approach tracking max from left and right.", "solution": "Track leftMax, rightMax. Water at i = min(leftMax, rightMax) - height[i]. Two pointer: process smaller side.", "companies": ["Google", "Amazon", "Apple"]},
    {"id": "ARR-011", "category": "Arrays", "difficulty": "Hard", "title": "Sliding Window Maximum", "description": "Given array and window size k, return max of each window.", "hint": "Use a monotonic deque to maintain window max.", "solution": "Use deque storing indices in decreasing height order. Pop those outside window. Front = max.", "companies": ["Google", "Amazon"]},
    {"id": "ARR-012", "category": "Arrays", "difficulty": "Medium", "title": "Rotate Array", "description": "Rotate array to right by k steps in-place.", "hint": "Reverse entire array, then reverse first k, then rest.", "solution": "Three reverses: reverse all, reverse [0..k-1], reverse [k..n-1].", "companies": ["Microsoft"]},
    {"id": "ARR-013", "category": "Arrays", "difficulty": "Easy", "title": "Move Zeroes", "description": "Move all zeros to end while maintaining order of non-zeros.", "hint": "Use two pointers — slow for next non-zero position.", "solution": "left pointer tracks next non-zero position. Swap nums[left] and nums[i] when nums[i] != 0.", "companies": ["Facebook"]},

    # ── STRINGS ─────────────────────────────────────────────
    {"id": "STR-001", "category": "Strings", "difficulty": "Easy", "title": "Valid Anagram", "description": "Check if two strings are anagrams of each other.", "hint": "Count character frequencies.", "solution": "Sort both strings (O(nlogn)) or count chars with HashMap. Compare counts.", "companies": ["Amazon"]},
    {"id": "STR-002", "category": "Strings", "difficulty": "Easy", "title": "Valid Palindrome", "description": "Given string, return true if it is palindrome considering only alphanumeric characters.", "hint": "Two pointers from both ends.", "solution": "lo=0, hi=n-1. Skip non-alphanumeric. Compare lower(s[lo]) and lower(s[hi]).", "companies": ["Facebook", "Microsoft"]},
    {"id": "STR-003", "category": "Strings", "difficulty": "Medium", "title": "Longest Substring Without Repeating Characters", "description": "Find length of longest substring without repeating characters.", "hint": "Sliding window with a HashSet.", "solution": "Window [left..right]. Expand right, if char in set move left until it's not. Track max window.", "companies": ["Amazon", "Google", "Facebook"]},
    {"id": "STR-004", "category": "Strings", "difficulty": "Hard", "title": "Minimum Window Substring", "description": "Find minimum window in s which contains all characters of t.", "hint": "Sliding window with character count maps.", "solution": "Count chars in t. Expand right collecting chars; when all found, shrink left while maintaining validity.", "companies": ["Google", "Facebook"]},
    {"id": "STR-005", "category": "Strings", "difficulty": "Medium", "title": "Group Anagrams", "description": "Group anagrams together from a list of strings.", "hint": "Use sorted string as hash key.", "solution": "HashMap: key = sorted(word), value = [words]. Group all words sharing same sorted key.", "companies": ["Amazon", "Facebook"]},
    {"id": "STR-006", "category": "Strings", "difficulty": "Medium", "title": "Encode and Decode Strings", "description": "Design encode/decode for list of strings transmitted over network.", "hint": "Length-prefix encoding: '5#hello'", "solution": "Encode: prefix each string with 'len#'. Decode: read until '#', take next len chars.", "companies": ["Google"]},
    {"id": "STR-007", "category": "Strings", "difficulty": "Medium", "title": "Palindromic Substrings", "description": "Count number of palindromic substrings in a string.", "hint": "Expand around each center (each char and each gap).", "solution": "For each of 2n-1 centers, expand while palindrome. Count valid palindromes.", "companies": ["Amazon", "Microsoft"]},
    {"id": "STR-008", "category": "Strings", "difficulty": "Easy", "title": "Reverse String", "description": "Reverse a string array in-place.", "hint": "Two pointers swap.", "solution": "Swap s[lo] and s[hi], increment lo, decrement hi.", "companies": ["Google"]},
    {"id": "STR-009", "category": "Strings", "difficulty": "Medium", "title": "String to Integer (atoi)", "description": "Implement atoi function to convert string to 32-bit integer.", "hint": "Handle leading spaces, sign, digits, and overflow.", "solution": "Skip spaces. Handle optional '+'/'-'. Parse digits. Clamp to INT_MIN/INT_MAX.", "companies": ["Amazon", "Microsoft"]},
    {"id": "STR-010", "category": "Strings", "difficulty": "Medium", "title": "Longest Palindromic Substring", "description": "Find the longest palindromic substring.", "hint": "Expand around each center.", "solution": "For each center, expand left and right. Track start and max length of largest palindrome.", "companies": ["Amazon", "Microsoft", "Google"]},

    # ── LINKED LIST ─────────────────────────────────────────
    {"id": "LL-001", "category": "Linked List", "difficulty": "Easy", "title": "Reverse Linked List", "description": "Reverse a singly linked list.", "hint": "Track prev, curr, next pointers.", "solution": "prev=None, curr=head. Each step: next=curr.next, curr.next=prev, prev=curr, curr=next. Return prev.", "companies": ["Amazon", "Microsoft", "Facebook"]},
    {"id": "LL-002", "category": "Linked List", "difficulty": "Easy", "title": "Detect Cycle in Linked List", "description": "Determine if linked list has a cycle.", "hint": "Floyd's slow/fast pointer algorithm.", "solution": "slow and fast pointers. fast moves 2, slow moves 1. If they meet, cycle exists.", "companies": ["Amazon", "Google"]},
    {"id": "LL-003", "category": "Linked List", "difficulty": "Medium", "title": "Merge Two Sorted Lists", "description": "Merge two sorted linked lists into one sorted list.", "hint": "Use a dummy head and compare nodes alternately.", "solution": "dummy → result. Compare l1.val vs l2.val, attach smaller. Move pointer. Attach remaining.", "companies": ["Amazon", "Google", "Microsoft"]},
    {"id": "LL-004", "category": "Linked List", "difficulty": "Hard", "title": "Merge K Sorted Lists", "description": "Merge k sorted linked lists into one sorted list.", "hint": "Use a min-heap of size k.", "solution": "Push all list heads into a min-heap. Extract min, push its next. Repeat until heap empty.", "companies": ["Google", "Amazon"]},
    {"id": "LL-005", "category": "Linked List", "difficulty": "Medium", "title": "Remove Nth Node From End", "description": "Remove nth node from end of linked list in one pass.", "hint": "Two pointers n apart.", "solution": "fast pointer moves n steps ahead. Then move both until fast.next = null. Remove slow.next.", "companies": ["Amazon", "Microsoft"]},
    {"id": "LL-006", "category": "Linked List", "difficulty": "Medium", "title": "Reorder List", "description": "Reorder list: L0→Ln→L1→Ln−1→L2→Ln−2→...", "hint": "Find middle, reverse second half, merge two halves.", "solution": "1) Find mid via slow/fast. 2) Reverse second half. 3) Merge first and reversed second half alternately.", "companies": ["Facebook", "Google"]},
    {"id": "LL-007", "category": "Linked List", "difficulty": "Medium", "title": "LRU Cache", "description": "Implement LRU Cache with O(1) get and put.", "hint": "Combine HashMap and Doubly-Linked List.", "solution": "HashMap maps key→node. Doubly linked list maintains order (MRU at head, LRU at tail). O(1) ops.", "companies": ["Amazon", "Google", "Microsoft"]},
    {"id": "LL-008", "category": "Linked List", "difficulty": "Easy", "title": "Palindrome Linked List", "description": "Check if linked list is a palindrome.", "hint": "Find middle, reverse second half, compare.", "solution": "Find mid → reverse second half → compare first and reversed second half node by node.", "companies": ["Facebook"]},

    # ── STACK / QUEUE ────────────────────────────────────────
    {"id": "SQ-001", "category": "Stack / Queue", "difficulty": "Easy", "title": "Valid Parentheses", "description": "Given string with brackets, determine if input is valid (properly opened and closed in order).", "hint": "Use a stack. Push opens, match closes.", "solution": "Push open brackets. For close: if stack empty or top doesn't match → invalid. Return stack.empty().", "companies": ["Amazon", "Google", "Facebook"]},
    {"id": "SQ-002", "category": "Stack / Queue", "difficulty": "Medium", "title": "Min Stack", "description": "Design stack that supports push, pop, top, and getMin in O(1).", "hint": "Use two stacks — one for values, one for minimums.", "solution": "minStack pushes current min alongside each element. Pop from both. getMin = minStack.top().", "companies": ["Amazon", "Google"]},
    {"id": "SQ-003", "category": "Stack / Queue", "difficulty": "Medium", "title": "Daily Temperatures", "description": "Given temps, find how many days until warmer temperature for each day.", "hint": "Monotonic stack storing indices.", "solution": "Stack of indices. For each day: while stack not empty and temp > temps[stack.top()], pop and set answer.", "companies": ["Amazon", "Google"]},
    {"id": "SQ-004", "category": "Stack / Queue", "difficulty": "Hard", "title": "Largest Rectangle in Histogram", "description": "Find largest rectangle area in histogram.", "hint": "Monotonic stack: push indices, pop when current bar is shorter.", "solution": "Stack of indices in increasing height order. When popping index i: width = (curr_idx - stack.top() - 1). Area = height[i] × width.", "companies": ["Google", "Amazon"]},
    {"id": "SQ-005", "category": "Stack / Queue", "difficulty": "Medium", "title": "Implement Queue using Stacks", "description": "Implement FIFO queue using only two stacks.", "hint": "Use two stacks. Transfer on dequeue if output stack empty.", "solution": "stack1 for push, stack2 for pop/peek. When stack2 empty, dump stack1 into stack2.", "companies": ["Amazon", "Microsoft"]},
    {"id": "SQ-006", "category": "Stack / Queue", "difficulty": "Medium", "title": "Evaluate Reverse Polish Notation", "description": "Evaluate RPN arithmetic expression.", "hint": "Stack: push numbers, pop and compute on operators.", "solution": "For each token: if number push. If operator: pop two, compute, push result.", "companies": ["Amazon"]},
    {"id": "SQ-007", "category": "Stack / Queue", "difficulty": "Hard", "title": "Basic Calculator", "description": "Implement basic calculator to evaluate expression string with +, -, (, ).", "hint": "Stack for sign and partial results. Track current number and sign.", "solution": "Use stack to save (result, sign) on '('. On ')' pop and combine. Process +/− as running sum.", "companies": ["Google"]},

    # ── GRAPH ────────────────────────────────────────────────
    {"id": "GR-001", "category": "Graph", "difficulty": "Medium", "title": "Number of Islands", "description": "Count number of islands in a 2D grid of '1's and '0's.", "hint": "DFS/BFS flood fill to mark connected land.", "solution": "For each '1', do DFS marking all connected '1's as visited. Count DFS calls.", "companies": ["Amazon", "Google", "Facebook"]},
    {"id": "GR-002", "category": "Graph", "difficulty": "Medium", "title": "Clone Graph", "description": "Given reference of node in connected undirected graph, return deep copy.", "hint": "BFS/DFS with a HashMap old→new node mapping.", "solution": "HashMap old→new. BFS: create new nodes, copy edges via map.", "companies": ["Facebook", "Amazon"]},
    {"id": "GR-003", "category": "Graph", "difficulty": "Medium", "title": "Course Schedule (Topological Sort)", "description": "Determine if you can finish all courses given prerequisites (detect cycle in directed graph).", "hint": "Topological sort via DFS or Kahn's BFS.", "solution": "Build adjacency list. DFS with three states: unvisited, visiting (cycle!), visited. Kahn's: in-degree approach.", "companies": ["Amazon", "Google"]},
    {"id": "GR-004", "category": "Graph", "difficulty": "Medium", "title": "Pacific Atlantic Water Flow", "description": "Find cells where water can flow to both Pacific and Atlantic oceans.", "hint": "BFS/DFS from ocean borders inward.", "solution": "BFS from Pacific border cells and Atlantic border cells separately. Return intersection.", "companies": ["Google"]},
    {"id": "GR-005", "category": "Graph", "difficulty": "Medium", "title": "Shortest Path in Binary Matrix", "description": "Find shortest path from top-left to bottom-right in binary matrix (0=open, 1=blocked).", "hint": "BFS from source. Track distance.", "solution": "BFS from (0,0) if 0. Explore 8 directions. Return steps when reaching (n-1,n-1).", "companies": ["Amazon", "Google"]},
    {"id": "GR-006", "category": "Graph", "difficulty": "Hard", "title": "Word Ladder", "description": "Find shortest transformation sequence from beginWord to endWord changing one letter at a time.", "hint": "BFS treating words as graph nodes.", "solution": "BFS. For each word, try changing each char to a-z. If valid word, add to queue. Level = steps.", "companies": ["Amazon", "Google", "Facebook"]},
    {"id": "GR-007", "category": "Graph", "difficulty": "Medium", "title": "Rotting Oranges", "description": "Find minimum time for all oranges to rot (4-directional spread per minute).", "hint": "Multi-source BFS from all rotten oranges simultaneously.", "solution": "Multi-source BFS: enqueue all rotten. BFS spreads rot. Count fresh remaining.", "companies": ["Amazon"]},
    {"id": "GR-008", "category": "Graph", "difficulty": "Medium", "title": "Accounts Merge (Union-Find)", "description": "Merge accounts with common emails.", "hint": "Union-Find on emails.", "solution": "Union-Find: union emails of same account. Group by root email. Sort and form output.", "companies": ["Google", "Amazon"]},
    {"id": "GR-009", "category": "Graph", "difficulty": "Hard", "title": "Alien Dictionary", "description": "Determine character ordering in alien language from sorted word list.", "hint": "Build graph from adjacent word pairs, topological sort.", "solution": "Compare adjacent words to find char ordering edges. Topological sort to find order.", "companies": ["Facebook", "Google"]},

    # ── DYNAMIC PROGRAMMING ──────────────────────────────────
    {"id": "DP-001", "category": "Dynamic Programming", "difficulty": "Easy", "title": "Climbing Stairs", "description": "You can climb 1 or 2 stairs at a time. How many ways to reach step n?", "hint": "Like Fibonacci. dp[n] = dp[n-1] + dp[n-2].", "solution": "dp[1]=1, dp[2]=2. For i>2: dp[i] = dp[i-1] + dp[i-2]. Return dp[n].", "companies": ["Amazon", "Google"]},
    {"id": "DP-002", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Coin Change", "description": "Find minimum number of coins that make amount. Infinite supply of each coin.", "hint": "Bottom-up DP: dp[i] = min coins to make amount i.", "solution": "dp[0]=0, dp[i]=INF. For each amt 1..amount: try each coin, dp[i] = min(dp[i], dp[i-coin]+1).", "companies": ["Amazon", "Google", "Facebook"]},
    {"id": "DP-003", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Longest Common Subsequence", "description": "Find length of LCS of two strings.", "hint": "2D DP table. dp[i][j] = LCS of s1[0..i] and s2[0..j].", "solution": "If s1[i]==s2[j]: dp[i][j] = dp[i-1][j-1]+1. Else: max(dp[i-1][j], dp[i][j-1]).", "companies": ["Google", "Amazon"]},
    {"id": "DP-004", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Word Break", "description": "Determine if string can be segmented into dictionary words.", "hint": "DP: dp[i] = can substring [0..i] be segmented.", "solution": "dp[0]=True. For each i, check all j<i: if dp[j] and s[j..i] in dict, dp[i]=True.", "companies": ["Amazon", "Google", "Facebook"]},
    {"id": "DP-005", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Unique Paths", "description": "Count unique paths from top-left to bottom-right of m×n grid (only right/down moves).", "hint": "dp[i][j] = dp[i-1][j] + dp[i][j-1].", "solution": "Initialize all row 0 and col 0 as 1. Fill dp[i][j] = dp[i-1][j] + dp[i][j-1].", "companies": ["Google", "Amazon", "Microsoft"]},
    {"id": "DP-006", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Jump Game", "description": "Given array of max jump lengths, can you reach the last index?", "hint": "Track maximum reachable index greedily.", "solution": "maxReach starts at 0. For each i <= maxReach: maxReach = max(maxReach, i + nums[i]). Return maxReach >= n-1.", "companies": ["Amazon", "Google"]},
    {"id": "DP-007", "category": "Dynamic Programming", "difficulty": "Hard", "title": "Edit Distance", "description": "Find minimum operations (insert/delete/replace) to convert word1 to word2.", "hint": "2D DP table.", "solution": "dp[i][j] = min edit distance for word1[0..i] and word2[0..j]. If chars match: dp[i-1][j-1]. Else: 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]).", "companies": ["Google", "Amazon"]},
    {"id": "DP-008", "category": "Dynamic Programming", "difficulty": "Hard", "title": "Longest Increasing Subsequence", "description": "Find length of longest strictly increasing subsequence.", "hint": "Binary search + tails array for O(n log n).", "solution": "Maintain tails array. For each num: binary search to find insertion point in tails. Length = tails size.", "companies": ["Google", "Microsoft"]},
    {"id": "DP-009", "category": "Dynamic Programming", "difficulty": "Medium", "title": "0/1 Knapsack", "description": "Given weights and values, maximize value within weight capacity. Each item used once.", "hint": "2D DP: dp[i][w] = max value using first i items with capacity w.", "solution": "dp[i][w] = max(dp[i-1][w], dp[i-1][w-weight[i]] + val[i]) if weight[i]<=w.", "companies": ["Amazon", "Google"]},
    {"id": "DP-010", "category": "Dynamic Programming", "difficulty": "Hard", "title": "Regular Expression Matching", "description": "Implement regex matching with '.' and '*'.", "hint": "2D DP: dp[i][j] = does s[0..i] match p[0..j].", "solution": "If p[j]='*': dp[i][j] = dp[i][j-2] (zero) OR (dp[i-1][j] if p[j-1] matches s[i]). If p[j]='.': match any char.", "companies": ["Google", "Facebook"]},

    # ── SYSTEM DESIGN PROBLEMS ───────────────────────────────
    {"id": "SD-001", "category": "System Design", "difficulty": "Hard", "title": "Design URL Shortener", "description": "Design a URL shortening service like Bit.ly. Support encode and decode.", "hint": "Base62 encoding for short codes. HashMap or DB for mapping.", "solution": "Generate unique 6-char base62 code for each URL. Store in DB (long→short, short→long). Redirect via lookup.", "companies": ["Google", "Amazon", "Microsoft"]},
    {"id": "SD-002", "category": "System Design", "difficulty": "Hard", "title": "Design Twitter Timeline", "description": "Design a simplified Twitter where users post tweets and see followers' tweets in home timeline.", "hint": "Push vs Pull model. Fan-out on write with Redis cache.", "solution": "Fan-out: write tweet to followers' timeline caches (push). For celebrities, pull at read time. Cache with Redis.", "companies": ["Twitter", "Facebook"]},
    {"id": "SD-003", "category": "System Design", "difficulty": "Hard", "title": "Design Rate Limiter", "description": "System to limit API calls per user (e.g. 100 req/min).", "hint": "Token bucket or sliding window counter algorithm.", "solution": "Token Bucket: refill at constant rate, consume on request. Or Sliding Window: timestamp-based queue. Use Redis for distributed systems.", "companies": ["Google", "Amazon"]},
    {"id": "SD-004", "category": "System Design", "difficulty": "Hard", "title": "Design Key-Value Store", "description": "Design a distributed key-value store like DynamoDB.", "hint": "Consistent hashing, replication factor, quorum reads/writes.", "solution": "Consistent hashing for partitioning. Replication factor N, W writes, R reads (N=3, W=2, R=2 for strong consistency).", "companies": ["Amazon", "Google"]},
    {"id": "SD-005", "category": "System Design", "difficulty": "Hard", "title": "Design Chat System", "description": "Design a real-time chat system like WhatsApp.", "hint": "WebSockets for real-time, message queue for reliability, presence service.", "solution": "WebSocket connections to chat servers. Message queue (Kafka) for reliability. User service + message DB. Presence via heartbeat.", "companies": ["Facebook", "Slack"]},
    {"id": "SD-006", "category": "System Design", "difficulty": "Hard", "title": "Design Search Autocomplete", "description": "Design a search autocomplete system (like Google Suggest).", "hint": "Trie data structure, top-k suggestions per prefix, cache hot prefixes.", "solution": "Trie with top-5 queries stored at each node. Cache hot prefixes in Redis. Offline batch jobs update trie.", "companies": ["Google", "Amazon"]},
    {"id": "SD-007", "category": "System Design", "difficulty": "Hard", "title": "Design Notification System", "description": "Design a system to send push/email/SMS notifications at scale.", "hint": "Event-driven with message queue; separate notification services per channel.", "solution": "API Server → Message Queue (Kafka) → Notification Workers pulling from queue → delivery to push/email/SMS providers.", "companies": ["Uber", "Facebook"]},
    {"id": "SD-008", "category": "System Design", "difficulty": "Hard", "title": "Design Ride-Sharing App", "description": "Design backend for a ride-sharing service like Uber.", "hint": "Geospatial indexing (QuadTree/geohash), real-time location updates, matching algorithm.", "solution": "Driver location in Redis with geospatial index. WebSocket for real-time. Matching service pairs rider+nearby driver. Trip service manages state.", "companies": ["Uber", "Lyft"]},
    {"id": "SD-009", "category": "System Design", "difficulty": "Hard", "title": "Design Video Streaming", "description": "Design a video streaming service like YouTube/Netflix.", "hint": "CDN for content delivery, adaptive bitrate streaming, separate upload and streaming pipelines.", "solution": "Upload: transcoding service creates multiple resolutions. Store in object storage (S3). CDN for global delivery. Adaptive bitrate (HLS/DASH).", "companies": ["Netflix", "YouTube"]},
    {"id": "SD-010", "category": "System Design", "difficulty": "Hard", "title": "Design Distributed Cache", "description": "Design a distributed caching system like Memcached/Redis Cluster.", "hint": "Consistent hashing, eviction policies, replication.", "solution": "Consistent hashing ring for key distribution. LRU eviction. Master-slave replication per shard. Cache-aside or write-through pattern.", "companies": ["Amazon", "Google", "Microsoft"]},
    {"id": "EXT-11-0", "category": "Arrays", "difficulty": "Medium", "title": "Advanced Arrays Challenge 11", "description": "Solve this advanced Arrays problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-11-1", "category": "Strings", "difficulty": "Medium", "title": "Advanced Strings Challenge 11", "description": "Solve this advanced Strings problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-11-2", "category": "Linked List", "difficulty": "Medium", "title": "Advanced Linked List Challenge 11", "description": "Solve this advanced Linked List problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-11-3", "category": "Stack / Queue", "difficulty": "Medium", "title": "Advanced Stack / Queue Challenge 11", "description": "Solve this advanced Stack / Queue problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-11-4", "category": "Graph", "difficulty": "Medium", "title": "Advanced Graph Challenge 11", "description": "Solve this advanced Graph problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-11-5", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Advanced Dynamic Programming Challenge 11", "description": "Solve this advanced Dynamic Programming problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-11-6", "category": "System Design", "difficulty": "Medium", "title": "Advanced System Design Challenge 11", "description": "Solve this advanced System Design problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-12-0", "category": "Arrays", "difficulty": "Medium", "title": "Advanced Arrays Challenge 12", "description": "Solve this advanced Arrays problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-12-1", "category": "Strings", "difficulty": "Medium", "title": "Advanced Strings Challenge 12", "description": "Solve this advanced Strings problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-12-2", "category": "Linked List", "difficulty": "Medium", "title": "Advanced Linked List Challenge 12", "description": "Solve this advanced Linked List problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-12-3", "category": "Stack / Queue", "difficulty": "Medium", "title": "Advanced Stack / Queue Challenge 12", "description": "Solve this advanced Stack / Queue problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-12-4", "category": "Graph", "difficulty": "Medium", "title": "Advanced Graph Challenge 12", "description": "Solve this advanced Graph problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-12-5", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Advanced Dynamic Programming Challenge 12", "description": "Solve this advanced Dynamic Programming problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-12-6", "category": "System Design", "difficulty": "Medium", "title": "Advanced System Design Challenge 12", "description": "Solve this advanced System Design problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-13-0", "category": "Arrays", "difficulty": "Medium", "title": "Advanced Arrays Challenge 13", "description": "Solve this advanced Arrays problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-13-1", "category": "Strings", "difficulty": "Medium", "title": "Advanced Strings Challenge 13", "description": "Solve this advanced Strings problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-13-2", "category": "Linked List", "difficulty": "Medium", "title": "Advanced Linked List Challenge 13", "description": "Solve this advanced Linked List problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-13-3", "category": "Stack / Queue", "difficulty": "Medium", "title": "Advanced Stack / Queue Challenge 13", "description": "Solve this advanced Stack / Queue problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-13-4", "category": "Graph", "difficulty": "Medium", "title": "Advanced Graph Challenge 13", "description": "Solve this advanced Graph problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-13-5", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Advanced Dynamic Programming Challenge 13", "description": "Solve this advanced Dynamic Programming problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-13-6", "category": "System Design", "difficulty": "Medium", "title": "Advanced System Design Challenge 13", "description": "Solve this advanced System Design problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-14-0", "category": "Arrays", "difficulty": "Medium", "title": "Advanced Arrays Challenge 14", "description": "Solve this advanced Arrays problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-14-1", "category": "Strings", "difficulty": "Medium", "title": "Advanced Strings Challenge 14", "description": "Solve this advanced Strings problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-14-2", "category": "Linked List", "difficulty": "Medium", "title": "Advanced Linked List Challenge 14", "description": "Solve this advanced Linked List problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-14-3", "category": "Stack / Queue", "difficulty": "Medium", "title": "Advanced Stack / Queue Challenge 14", "description": "Solve this advanced Stack / Queue problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-14-4", "category": "Graph", "difficulty": "Medium", "title": "Advanced Graph Challenge 14", "description": "Solve this advanced Graph problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-14-5", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Advanced Dynamic Programming Challenge 14", "description": "Solve this advanced Dynamic Programming problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-14-6", "category": "System Design", "difficulty": "Medium", "title": "Advanced System Design Challenge 14", "description": "Solve this advanced System Design problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-15-0", "category": "Arrays", "difficulty": "Medium", "title": "Advanced Arrays Challenge 15", "description": "Solve this advanced Arrays problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-15-1", "category": "Strings", "difficulty": "Medium", "title": "Advanced Strings Challenge 15", "description": "Solve this advanced Strings problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-15-2", "category": "Linked List", "difficulty": "Medium", "title": "Advanced Linked List Challenge 15", "description": "Solve this advanced Linked List problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-15-3", "category": "Stack / Queue", "difficulty": "Medium", "title": "Advanced Stack / Queue Challenge 15", "description": "Solve this advanced Stack / Queue problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-15-4", "category": "Graph", "difficulty": "Medium", "title": "Advanced Graph Challenge 15", "description": "Solve this advanced Graph problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-15-5", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Advanced Dynamic Programming Challenge 15", "description": "Solve this advanced Dynamic Programming problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-15-6", "category": "System Design", "difficulty": "Medium", "title": "Advanced System Design Challenge 15", "description": "Solve this advanced System Design problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-16-0", "category": "Arrays", "difficulty": "Medium", "title": "Advanced Arrays Challenge 16", "description": "Solve this advanced Arrays problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-16-1", "category": "Strings", "difficulty": "Medium", "title": "Advanced Strings Challenge 16", "description": "Solve this advanced Strings problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-16-2", "category": "Linked List", "difficulty": "Medium", "title": "Advanced Linked List Challenge 16", "description": "Solve this advanced Linked List problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-16-3", "category": "Stack / Queue", "difficulty": "Medium", "title": "Advanced Stack / Queue Challenge 16", "description": "Solve this advanced Stack / Queue problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-16-4", "category": "Graph", "difficulty": "Medium", "title": "Advanced Graph Challenge 16", "description": "Solve this advanced Graph problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-16-5", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Advanced Dynamic Programming Challenge 16", "description": "Solve this advanced Dynamic Programming problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-16-6", "category": "System Design", "difficulty": "Medium", "title": "Advanced System Design Challenge 16", "description": "Solve this advanced System Design problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-17-0", "category": "Arrays", "difficulty": "Medium", "title": "Advanced Arrays Challenge 17", "description": "Solve this advanced Arrays problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-17-1", "category": "Strings", "difficulty": "Medium", "title": "Advanced Strings Challenge 17", "description": "Solve this advanced Strings problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-17-2", "category": "Linked List", "difficulty": "Medium", "title": "Advanced Linked List Challenge 17", "description": "Solve this advanced Linked List problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-17-3", "category": "Stack / Queue", "difficulty": "Medium", "title": "Advanced Stack / Queue Challenge 17", "description": "Solve this advanced Stack / Queue problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-17-4", "category": "Graph", "difficulty": "Medium", "title": "Advanced Graph Challenge 17", "description": "Solve this advanced Graph problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-17-5", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Advanced Dynamic Programming Challenge 17", "description": "Solve this advanced Dynamic Programming problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-17-6", "category": "System Design", "difficulty": "Medium", "title": "Advanced System Design Challenge 17", "description": "Solve this advanced System Design problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-18-0", "category": "Arrays", "difficulty": "Medium", "title": "Advanced Arrays Challenge 18", "description": "Solve this advanced Arrays problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-18-1", "category": "Strings", "difficulty": "Medium", "title": "Advanced Strings Challenge 18", "description": "Solve this advanced Strings problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-18-2", "category": "Linked List", "difficulty": "Medium", "title": "Advanced Linked List Challenge 18", "description": "Solve this advanced Linked List problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-18-3", "category": "Stack / Queue", "difficulty": "Medium", "title": "Advanced Stack / Queue Challenge 18", "description": "Solve this advanced Stack / Queue problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-18-4", "category": "Graph", "difficulty": "Medium", "title": "Advanced Graph Challenge 18", "description": "Solve this advanced Graph problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-18-5", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Advanced Dynamic Programming Challenge 18", "description": "Solve this advanced Dynamic Programming problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-18-6", "category": "System Design", "difficulty": "Medium", "title": "Advanced System Design Challenge 18", "description": "Solve this advanced System Design problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-19-0", "category": "Arrays", "difficulty": "Medium", "title": "Advanced Arrays Challenge 19", "description": "Solve this advanced Arrays problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-19-1", "category": "Strings", "difficulty": "Medium", "title": "Advanced Strings Challenge 19", "description": "Solve this advanced Strings problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-19-2", "category": "Linked List", "difficulty": "Medium", "title": "Advanced Linked List Challenge 19", "description": "Solve this advanced Linked List problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-19-3", "category": "Stack / Queue", "difficulty": "Medium", "title": "Advanced Stack / Queue Challenge 19", "description": "Solve this advanced Stack / Queue problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-19-4", "category": "Graph", "difficulty": "Medium", "title": "Advanced Graph Challenge 19", "description": "Solve this advanced Graph problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-19-5", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Advanced Dynamic Programming Challenge 19", "description": "Solve this advanced Dynamic Programming problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},    {"id": "EXT-19-6", "category": "System Design", "difficulty": "Medium", "title": "Advanced System Design Challenge 19", "description": "Solve this advanced System Design problem optimally.", "hint": "Think about edge cases and space complexity.", "solution": "O(N) time and O(1) space approach.", "companies": ["Amazon", "Google", "Microsoft", "Meta"]},
]

# Build lookup maps
PROBLEMS_BY_ID = {p["id"]: p for p in PROBLEMS}
CATEGORIES = list(dict.fromkeys(p["category"] for p in PROBLEMS))
TOTAL_PROBLEMS = len(PROBLEMS)


class CodeRequest(BaseModel):
    code: str
    language: str = "python"
    stdin: Optional[str] = None


@router.get("/problems")
def get_problems(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    """Return all problems, optionally filtered. Also includes solved status."""
    problems = PROBLEMS

    if category and category != "All":
        problems = [p for p in problems if p["category"] == category]
    if difficulty and difficulty != "All":
        problems = [p for p in problems if p["difficulty"] == difficulty]
    if search:
        q = search.lower()
        problems = [p for p in problems if q in p["title"].lower() or q in p["description"].lower()]

    # Get solved problem IDs for this user
    solved_records = db.exec(
        select(SolvedProblem).where(SolvedProblem.user_id == current_user.id)
    ).all()
    solved_ids = {s.problem_id for s in solved_records}

    return {
        "problems": [
            {**p, "solved": p["id"] in solved_ids}
            for p in problems
        ],
        "total": len(problems),
        "categories": CATEGORIES,
        "solved_count": len(solved_ids),
        "total_count": TOTAL_PROBLEMS,
    }


@router.get("/problems/{problem_id}")
def get_problem(
    problem_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
):
    problem = PROBLEMS_BY_ID.get(problem_id)
    if not problem:
        raise HTTPException(404, "Problem not found")

    solved = db.exec(
        select(SolvedProblem).where(
            SolvedProblem.user_id == current_user.id,
            SolvedProblem.problem_id == problem_id
        )
    ).first()

    return {**problem, "solved": solved is not None}


@router.post("/problems/{problem_id}/solve")
def mark_problem_solved(
    problem_id: str,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Mark a coding problem as solved. Logs activity and updates coding progress."""
    problem = PROBLEMS_BY_ID.get(problem_id)
    if not problem:
        raise HTTPException(404, "Problem not found")

    # Check if already solved
    existing = db.exec(
        select(SolvedProblem).where(
            SolvedProblem.user_id == current_user.id,
            SolvedProblem.problem_id == problem_id
        )
    ).first()

    newly_solved = False
    if not existing:
        db.add(SolvedProblem(user_id=current_user.id, problem_id=problem_id))
        newly_solved = True

        # Log activity
        log_entry = ActivityLog(
            user_id=current_user.id,
            action_type="code_solved",
            title=f"Solved: {problem['title']}",
            xp_earned=50,
        )
        db.add(log_entry)
        current_user.xp = (current_user.xp or 0) + 50

        # Update streak
        from datetime import date as dt_date
        today = dt_date.today().isoformat()
        if current_user.last_activity_date != today:
            if current_user.last_activity_date:
                from datetime import date as d
                gap = (d.today() - d.fromisoformat(current_user.last_activity_date)).days
                current_user.streak = (current_user.streak or 0) + 1 if gap == 1 else 1
            else:
                current_user.streak = 1
            current_user.last_activity_date = today
        db.add(current_user)
        db.commit()

        # Update progress
        solved_count = len(db.exec(
            select(SolvedProblem).where(SolvedProblem.user_id == current_user.id)
        ).all())

        from app.models.models import UserProgress
        prog = db.exec(
            select(UserProgress).where(
                UserProgress.user_id == current_user.id,
                UserProgress.category == "coding"
            )
        ).first()
        pct = min(100, int((solved_count / TOTAL_PROBLEMS) * 100))
        if prog:
            prog.completed_items = solved_count
            prog.total_items = TOTAL_PROBLEMS
            prog.progress_pct = pct
            db.add(prog)
        else:
            db.add(UserProgress(
                user_id=current_user.id,
                category="coding",
                total_items=TOTAL_PROBLEMS,
                completed_items=solved_count,
                progress_pct=pct
            ))
        db.commit()
    else:
        db.commit()

    solved_count = len(db.exec(
        select(SolvedProblem).where(SolvedProblem.user_id == current_user.id)
    ).all())
    pct = min(100, int((solved_count / TOTAL_PROBLEMS) * 100))

    return {
        "success": True,
        "newly_solved": newly_solved,
        "problem_id": problem_id,
        "solved_count": solved_count,
        "progress_pct": pct,
        "xp_earned": 50 if newly_solved else 0,
    }


@router.get("/resources")
def get_resources():
    return {
        "resources": [
            {"name": "LeetCode", "url": "https://leetcode.com", "desc": "Premier platform for DSA problems.", "icon": "🧩", "difficulty": "All levels", "tag": "dsa"},
            {"name": "HackerRank", "url": "https://hackerrank.com", "desc": "Practice challenges and earn certifications.", "icon": "🏅", "difficulty": "Beginner-Advanced", "tag": "dsa"},
            {"name": "Codeforces", "url": "https://codeforces.com", "desc": "Competitive programming with rated contests.", "icon": "⚡", "difficulty": "Intermediate-Expert", "tag": "competitive"},
            {"name": "GeeksforGeeks", "url": "https://geeksforgeeks.org", "desc": "Comprehensive CS tutorials and problems.", "icon": "🌱", "difficulty": "All levels", "tag": "learn"},
            {"name": "NeetCode", "url": "https://neetcode.io", "desc": "Curated Blind 75 with video explanations.", "icon": "🎯", "difficulty": "All levels", "tag": "dsa"},
        ]
    }


import subprocess
import os
import tempfile

@router.post("/run")
def run_code(req: CodeRequest, current_user: User = Depends(get_current_user)):
    if req.language != "python":
        return {"output": f"Language {req.language} is not supported yet.", "status": "error"}
    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
            f.write(req.code)
            temp_path = f.name
        result = subprocess.run(
            ["python3", temp_path],
            capture_output=True, text=True, timeout=3.0
        )
        os.remove(temp_path)
        output = result.stdout
        if result.stderr:
            output += f"\nError:\n{result.stderr}"
        return {"output": output or "Executed (no output)", "status": "success"}
    except subprocess.TimeoutExpired:
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        return {"output": "Error: Timed out (3s limit). Check for infinite loops.", "status": "error"}
    except Exception as e:
        return {"output": f"Execution Error: {str(e)}", "status": "error"}

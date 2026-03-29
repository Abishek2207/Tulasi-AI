from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Optional, List

from app.api.deps import get_current_user
from app.models.models import User, SolvedProblem, ActivityLog, UserProgress
from app.core.database import get_session
from app.api.activity import log_activity_internal
from app.core.ai_router import get_ai_response

router = APIRouter()

# ============================================================
# 100+ CODING PROBLEMS DATASET
# ============================================================
PROBLEMS = [
    # ── ARRAYS ──────────────────────────────────────────────
    {"id": "ARR-001", "category": "Arrays", "difficulty": "Easy", "title": "Two Sum", "description": "Given an array of integers nums and integer target, return indices of two numbers that add up to target.", "hint": "Use a hash map to store each number's index as you iterate.", "solution": "Use HashMap: store num→index as you go. For each num, check if target-num exists in map.", "companies": ["Google", "Amazon", "Microsoft"], "sample_input": "nums = [2,7,11,15], target = 9", "sample_output": "[0,1]"},
    {"id": "ARR-002", "category": "Arrays", "difficulty": "Easy", "title": "Best Time to Buy and Sell Stock", "description": "Given array prices where prices[i] is price of stock on day i, find max profit from a single buy-sell.", "hint": "Track min price seen so far and compare profit.", "solution": "Track minPrice = Inf, maxProfit = 0. For each price: update minPrice, compute profit = price - minPrice, update maxProfit.", "companies": ["Amazon", "Facebook"], "sample_input": "prices = [7,1,5,3,6,4]", "sample_output": "5"},
    {"id": "ARR-003", "category": "Arrays", "difficulty": "Easy", "title": "Contains Duplicate", "description": "Given integer array, return true if any value appears at least twice.", "hint": "Use a set to track seen numbers.", "solution": "Add each element to a HashSet. If size doesn't increase, it's a duplicate.", "companies": ["Amazon"], "sample_input": "nums = [1,2,3,1]", "sample_output": "true"},
    {"id": "ARR-004", "category": "Arrays", "difficulty": "Easy", "title": "Product of Array Except Self", "description": "Return array output such that output[i] is equal to product of all elements except nums[i]. No division allowed.", "hint": "Use prefix and suffix product arrays.", "solution": "Two-pass approach: compute prefix products left→right, then suffix products right→left. Multiply prefix[i] * suffix[i].", "companies": ["Amazon", "Microsoft", "Apple"], "sample_input": "nums = [1,2,3,4]", "sample_output": "[24,12,8,6]"},
    {"id": "ARR-005", "category": "Arrays", "difficulty": "Medium", "title": "Maximum Subarray (Kadane's)", "description": "Find the contiguous subarray with the largest sum.", "hint": "Kadane's algorithm: extend or restart subarray at each step.", "solution": "maxCurrent = maxGlobal = nums[0]. For each num: maxCurrent = max(num, maxCurrent+num). Update maxGlobal.", "companies": ["Amazon", "Google", "Microsoft"], "sample_input": "nums = [-2,1,-3,4,-1,2,1,-5,4]", "sample_output": "6"},
    {"id": "ARR-006", "category": "Arrays", "difficulty": "Medium", "title": "3Sum", "description": "Find all unique triplets in array that give sum zero.", "hint": "Sort first, then use two pointers.", "solution": "Sort array. For each i, use lo/hi pointers. Adjust based on sum. Skip duplicates.", "companies": ["Facebook", "Google"], "sample_input": "nums = [-1,0,1,2,-1,-4]", "sample_output": "[[-1,-1,2],[-1,0,1]]"},
    {"id": "ARR-007", "category": "Arrays", "difficulty": "Medium", "title": "Container With Most Water", "description": "Given heights array, find two lines that form container with most water.", "hint": "Two pointers from both ends, always move shorter side.", "solution": "Start lo=0, hi=n-1. area = min(h[lo],h[hi]) * (hi-lo). Move smaller pointer inward.", "companies": ["Amazon", "Google"], "sample_input": "height = [1,8,6,2,5,4,8,3,7]", "sample_output": "49"},
    {"id": "ARR-008", "category": "Arrays", "difficulty": "Medium", "title": "Merge Intervals", "description": "Given array of intervals, merge all overlapping intervals.", "hint": "Sort by start time, then iteratively merge.", "solution": "Sort intervals by start. Iterate: if current start <= prev end, merge. Else add new interval.", "companies": ["Google", "Facebook", "Microsoft"], "sample_input": "intervals = [[1,3],[2,6],[8,10],[15,18]]", "sample_output": "[[1,6],[8,10],[15,18]]"},
    {"id": "ARR-009", "category": "Arrays", "difficulty": "Medium", "title": "Find Minimum in Rotated Sorted Array", "description": "Given rotated sorted array with unique elements, find minimum element.", "hint": "Binary search: compare mid with right to determine which half is sorted.", "solution": "Binary search: if mid > right, minimum is in right half. Else in left half.", "companies": ["Microsoft", "Amazon"], "sample_input": "nums = [3,4,5,1,2]", "sample_output": "1"},
    {"id": "ARR-010", "category": "Arrays", "difficulty": "Hard", "title": "Trapping Rain Water", "description": "Given heights, compute how much water it can trap after raining.", "hint": "Two-pointer approach tracking max from left and right.", "solution": "Track leftMax, rightMax. Water at i = min(leftMax, rightMax) - height[i]. Two pointer: process smaller side.", "companies": ["Google", "Amazon", "Apple"], "sample_input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]", "sample_output": "6"},
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
    {"id": "EXT-11-0", "category": "Arrays", "difficulty": "Medium", "title": "Longest Consecutive Sequence", "description": "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence. O(n) required.", "hint": "Use a HashSet for O(1) lookups.", "solution": "Add all to HashSet. For each num, if num-1 not in set, it's a start. Count consecutive upward.", "companies": ["Google", "Amazon"]},
    {"id": "EXT-11-1", "category": "Strings", "difficulty": "Medium", "title": "Simplify Path", "description": "Given an absolute path for a Unix-style file system, simplify it.", "hint": "Use a stack to process components.", "solution": "Split by '/'. If '.' or empty, skip. If '..', pop stack. Else push. Join with '/'.", "companies": ["Facebook"]},
    {"id": "EXT-11-2", "category": "Linked List", "difficulty": "Medium", "title": "Copy List with Random Pointer", "description": "Deep copy a linked list where each node contains an additional random pointer.", "hint": "Use a HashMap to store mapping from old node to new node.", "solution": "First pass: create all new nodes and map old->new. Second pass: link next and random pointers using map.", "companies": ["Amazon", "Microsoft"]},
    {"id": "EXT-11-3", "category": "Stack / Queue", "difficulty": "Medium", "title": "Simplify Path", "description": "Given an absolute path for a Unix-style file system, simplify it.", "hint": "Use a stack to track directory names.", "solution": "Split path by '/'. Iterate: if '..', pop from stack. If '.', ignore. Else push. Join stack with '/'.", "companies": ["Facebook", "Microsoft"]},
    {"id": "EXT-11-4", "category": "Graph", "difficulty": "Hard", "title": "Reconstruct Itinerary", "description": "Given a list of airline tickets, reconstruct the itinerary in order.", "hint": "Hierholzer's algorithm for Eulerian path.", "solution": "Build adjacency list (sorted). Use DFS and post-order traversal to build itinerary backwards, then reverse.", "companies": ["Google"]},
    {"id": "EXT-11-5", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Partition Equal Subset Sum", "description": "Partition an array into two subsets with equal sums.", "hint": "0/1 Knapsack style DP: can we form sum/2?", "solution": "If total sum is odd, impossible. Otherwise, find if any subset sums to totalSum/2 using 1D DP array.", "companies": ["Amazon", "Facebook"]},
    {"id": "EXT-11-6", "category": "System Design", "difficulty": "Hard", "title": "Design a Web Crawler", "description": "Design a scalable service to crawl and index trillions of web pages.", "hint": "Distributed workers, URL frontier, politeness, DNS cache, content deduplication.", "solution": "URL Frontier (Priority Queue) -> Fetchers -> Content Processor -> Link Extractor. Store metadata in NoSQL. Content hashing (SimHash) for dedup.", "companies": ["Google", "Microsoft"]},
    
    # ── ADDITIONAL 30+ PROBLEMS ──────────────────────────────
    {"id": "DSA-101", "category": "Arrays", "difficulty": "Easy", "title": "Find All Numbers Disappeared in an Array", "description": "Find all elements in [1, n] that do not appear in an array of n integers.", "hint": "Mark visited numbers by negating the value at that index.", "solution": "Iterate: nums[abs(n)-1] = -abs(nums[abs(n)-1]). Indices with positive values are missing.", "companies": ["Google", "Amazon"]},
    {"id": "DSA-102", "category": "Strings", "difficulty": "Easy", "title": "Isomorphic Strings", "description": "Check if two strings are isomorphic (character mapping exists).", "hint": "Use two maps to track character mappings both ways.", "solution": "Map s[i]->t[i] and t[i]->s[i]. If maps conflict, not isomorphic.", "companies": ["LinkedIn"]},
    {"id": "DSA-103", "category": "Linked List", "difficulty": "Easy", "title": "Intersection of Two Linked Lists", "description": "Find the node at which the intersection of two singly linked lists begins.", "hint": "Two pointers traversing both lists. Switch to other list head upon reaching end.", "solution": "Ptr A and B. When either hits end, move to head of other list. They meet at intersection point.", "companies": ["Amazon", "Microsoft"]},
    {"id": "DSA-104", "category": "Stack / Queue", "difficulty": "Easy", "title": "Implement Stack using Queues", "description": "Implement a LIFO stack using only two queues.", "hint": "In push: enqueue new element, then rotate existing elements behind it.", "solution": "Push: q.add(x) -> for i in range(len(q)-1): q.add(q.popleft()). Top is always at front.", "companies": ["Amazon"]},
    {"id": "DSA-105", "category": "Graph", "difficulty": "Easy", "title": "Find if Path Exists in Graph", "description": "Determine if there is a valid path between source and destination in undirected graph.", "hint": "DFS or BFS or Union-Find.", "solution": "Build adjacency list. BFS/DFS from source. If destination visited return true.", "companies": ["Amazon"]},
    {"id": "DSA-106", "category": "Dynamic Programming", "difficulty": "Easy", "title": "Maximum Multiplier Score", "description": "Maximum score attainable using DP.", "hint": "2D DP with state (num_index, multiplier_index).", "solution": "memo = {}. dfs(i, j): if j == m: return 0. Use num[i] * mult[j] + dfs(i+1, j+1).", "companies": ["Google"]},
    {"id": "DSA-107", "category": "Sort/Search", "difficulty": "Easy", "title": "Binary Search", "description": "Find target in sorted array in O(log n).", "hint": "Standard lo/hi/mid approach.", "solution": "while lo <= hi: mid = (lo+hi)//2. if nums[mid] == target: return mid. Adjust lo/hi.", "companies": ["All Companies"]},
    {"id": "DSA-108", "category": "Arrays", "difficulty": "Medium", "title": "Sort Colors (Dutch National Flag)", "description": "Sort array of 0s, 1s, 2s in-place with one pass.", "hint": "Three pointers: low, mid, high.", "solution": "mid=0, low=0, high=n-1. While mid <= high: swap 0s to low, 2s to high.", "companies": ["Amazon", "Microsoft"]},
    {"id": "DSA-109", "category": "Strings", "difficulty": "Medium", "title": "Multiply Strings", "description": "Multiply two non-negative integers represented as strings.", "hint": "Follow standard vertical multiplication rules in an array.", "solution": "Result array size m+n. res[i+j+1] += int(s1[i]) * int(s2[j]). Handle carries right to left.", "companies": ["Facebook"]},
    {"id": "DSA-110", "category": "Linked List", "difficulty": "Medium", "title": "Add Two Numbers", "description": "Add two numbers represented as linked lists in reverse order.", "hint": "Traverse both lists, handle carry over.", "solution": "curr.next = Node((v1+v2+carry)%10). carry = (v1+v2+carry)//10.", "companies": ["Amazon", "Google"]},
    {"id": "DSA-111", "category": "Stack / Queue", "difficulty": "Medium", "title": "Generate Parentheses", "description": "Generate all combinations of n pairs of well-formed parentheses.", "hint": "Backtracking: track count of open and close brackets.", "solution": "dfs(open, close): if open < n: dfs(open+1, close). if close < open: dfs(open, close+1).", "companies": ["Google", "Facebook"]},
    {"id": "DSA-112", "category": "Graph", "difficulty": "Medium", "title": "Target Sum", "description": "Find number of ways to assign signs (+/-) to reach target sum.", "hint": "Recursion with memoization or 0/1 knapsack variant.", "solution": "dfs(i, current_sum). memoize (i, current_sum).", "companies": ["Amazon", "Google"]},
    {"id": "DSA-113", "category": "Dynamic Programming", "difficulty": "Medium", "title": "Longest Palindromic Subsequence", "description": "Find length of LPS.", "hint": "If s[i] == s[j]: 2 + LPS(i+1, j-1). Else: max(LPS(i+1,j), LPS(i,j-1)).", "solution": "2D DP or memoization logic. LPS(i, j).", "companies": ["Amazon", "Microsoft"]},
    {"id": "DSA-114", "category": "Trees", "difficulty": "Easy", "title": "Inorder Traversal", "description": "Perform inorder traversal of a binary tree.", "hint": "Left, Root, Right.", "solution": "Recursive or Stack-based iterative approach.", "companies": ["All Companies"]},
    {"id": "DSA-115", "category": "Trees", "difficulty": "Medium", "title": "Binary Tree Level Order Traversal", "description": "Return level order traversal of tree nodes.", "hint": "Use BFS with a queue.", "solution": "queue = [root]. For each level, process all nodes, add children.", "companies": ["Amazon", "Facebook"]},
    {"id": "DSA-116", "category": "Trees", "difficulty": "Hard", "title": "Binary Tree Maximum Path Sum", "description": "Find maximum path sum between any two nodes.", "hint": "DFS returns max branch. Global variable for max path.", "solution": "dfs(node): left = max(0, dfs(node.left)), right = max(0, dfs(node.right)). Global max = max(globalMax, left+right+node.val). Return node.val + max(left,right).", "companies": ["Google", "Facebook"]},
    {"id": "DSA-117", "category": "Bit Manipulation", "difficulty": "Easy", "title": "Number of 1 Bits", "description": "Count set bits in an integer.", "hint": "n & (n-1) clears the least significant bit.", "solution": "while n: n &= (n-1); count += 1.", "companies": ["Apple", "Amazon"]},
    {"id": "DSA-118", "category": "Bit Manipulation", "difficulty": "Medium", "title": "Single Number II", "description": "Every element appears three times except one. Find it.", "hint": "Sum bits at each position modulo 3.", "solution": "Maintain 'ones' and 'twos' bitmasks. ones = (ones ^ n) & ~twos; twos = (twos ^ n) & ~ones.", "companies": ["Google"]},
    {"id": "DSA-119", "category": "Backtracking", "difficulty": "Medium", "title": "Subsets", "description": "Return all possible subsets (power set) of a set.", "hint": "Backtracking or binary masks.", "solution": "dfs(index, path): res.append(path). for i in range(index, n): dfs(i+1, path+[nums[i]]).", "companies": ["Amazon", "Facebook"]},
    {"id": "DSA-120", "category": "Heaps", "difficulty": "Medium", "title": "Kth Largest Element in an Array", "description": "Find kth largest element.", "hint": "Use a min-heap of size k OR Quickselect.", "solution": "Min-heap: push elements. If size > k, pop min. Heap top is Kth largest.", "companies": ["Facebook", "Amazon"]},
    {"id": "DSA-121", "category": "Trees", "difficulty": "Easy", "title": "Maximum Depth of Binary Tree", "description": "Find the maximum depth of a binary tree.", "hint": "1 + max(depth(left), depth(right)).", "solution": "Recursive DFS return 1 + max of both children depths.", "companies": ["Microsoft"]},
    {"id": "DSA-122", "category": "Trees", "difficulty": "Medium", "title": "Validate Binary Search Tree", "description": "Check if a tree is a valid BST.", "hint": "Check if inorder traversal is sorted or use range limits (min, max).", "solution": "dfs(node, min, max): node.val must be > min and < max.", "companies": ["Amazon"]},
    {"id": "DSA-123", "category": "Heaps", "difficulty": "Hard", "title": "Find Median from Data Stream", "description": "Design a data structure that supports adding numbers and finding the median.", "hint": "Use two heaps: a max-heap for lower half and min-heap for upper half.", "solution": "Balance both heaps such that size difference <= 1. Median is top(s) or average of tops.", "companies": ["Google", "Facebook"]},
    {"id": "CORE-101", "category": "Core CS", "difficulty": "Medium", "title": "Process vs Thread", "description": "Explain primary differences between processes and threads.", "hint": "Memory isolation vs shared memory space.", "solution": "Process: independent memory space, heavy context switch. Thread: shared memory, light context switch.", "companies": ["Intel", "Qualcomm"]},
    {"id": "CORE-102", "category": "Core CS", "difficulty": "Easy", "title": "HTTP vs HTTPS", "description": "Main difference between HTTP and HTTPS.", "hint": "Encryption and Port.", "solution": "HTTPS uses TLS/SSL for encryption (port 443). HTTP is plain text (port 80).", "companies": ["Cisco"]},
    {"id": "WEB-101", "category": "Web", "difficulty": "Medium", "title": "Explain Box Model in CSS", "description": "What are the components of the CSS box model?", "hint": "Content, Padding, Border, Margin.", "solution": "Every element is a box. Order: Content -> Padding -> Border -> Margin.", "companies": ["Adobe", "Salesforce"]},
    {"id": "WEB-102", "category": "Web", "difficulty": "Medium", "title": "What is LocalStorage?", "description": "Explain LocalStorage vs SessionStorage vs Cookies.", "hint": "Storage capacity and persistence.", "solution": "LocalStorage: indefinite persistence, ~5MB. SessionStorage: cleared on tab close. Cookies: small size (~4KB), sent to server.", "companies": ["Google", "Meta"]},
    {"id": "SQL-101", "category": "Database", "difficulty": "Easy", "title": "SQL Join Types", "description": "Explain difference between INNER, LEFT, RIGHT, and FULL JOIN.", "hint": "Venn diagrams.", "solution": "INNER: mutual match. LEFT: all left + matching right. RIGHT: all right + matching left. FULL: all rows.", "companies": ["Oracle", "SQL Server"]},
    {"id": "SQL-102", "category": "Database", "difficulty": "Medium", "title": "ACID Properties", "description": "Explain ACID in Database Management Systems.", "hint": "Atomicity, Consistency, Isolation, Durability.", "solution": "A: all-or-nothing. C: valid state. I: concurrent independent. D: persisted after success.", "companies": ["Goldman Sachs", "Morgan Stanley"]},
    {"id": "DSA-124", "category": "Greedy", "difficulty": "Medium", "title": "Gas Station", "description": "Find starting gas station to complete circuit.", "hint": "If total gas < total cost, return -1.", "solution": "Track total gas and surplus. If surplus < 0, reset start to next station.", "companies": ["Amazon", "Google"]},
    {"id": "DSA-125", "category": "Greedy", "difficulty": "Medium", "title": "Non-overlapping Intervals", "description": "Find minimum number of intervals to remove to make the rest non-overlapping.", "hint": "Sort by end times.", "solution": "Keep track of previous end time. If overlap, increment removal count.", "companies": ["Amazon", "Microsoft"]},
    {"id": "DSA-126", "category": "Tries", "difficulty": "Medium", "title": "Implement Trie (Prefix Tree)", "description": "Design a Trie with insert, search, and startsWith methods.", "hint": "Use a nested dictionary or node objects with 26 children array.", "solution": "Each node has 'isEndOfWord' flag and map of character children.", "companies": ["Google", "Amazon"]},
    {"id": "DSA-127", "category": "Heaps", "difficulty": "Medium", "title": "Top K Frequent Elements", "description": "Return the k most frequent elements in array.", "hint": "Bucket sort or Heap.", "solution": "HashMap count -> Bucket sort by frequency. Collect from end.", "companies": ["Amazon", "Google"]},
    {"id": "DSA-128", "category": "Backtracking", "difficulty": "Hard", "title": "N-Queens", "description": "Find all distinct solutions to N-Queens puzzle.", "hint": "Constraint satisfaction using columns, positive diagonals, and negative diagonals.", "solution": "Track cols, posDiag (r+c), negDiag (r-c) in sets. Place queen only if valid.", "companies": ["Google"]},
    {"id": "DSA-129", "category": "Graph", "difficulty": "Hard", "title": "Dijkstra's Algorithm", "description": "Find shortest path from source in weighted graph.", "hint": "Use a min-priority queue to explore shortest edges first.", "solution": "pq = [(0, source)]. While pq: pop shortest, relax neighbors, push if shorter path found.", "companies": ["Amazon", "Microsoft"]},
    {"id": "DSA-130", "category": "Dynamic Programming", "difficulty": "Hard", "title": "Burglary Problem (House Robber III)", "description": "Houses are in a binary tree. Don't rob adjacent houses.", "hint": "Each node returns [rob_node, skipped_node].", "solution": "res = [node.val + left[1] + right[1], max(left) + max(right)].", "companies": ["Amazon", "Google"]},

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
        problems = [
            p for p in problems 
            if q in str(p.get("title", "")).lower() or q in str(p.get("description", "")).lower()
        ]

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

        # Use centralized activity logging (this handles XP, Level, Streak, and Progress)
        log_activity_internal(
            current_user, db, "code_solved", f"Solved: {problem['title']}", problem_id
        )
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
import time

# Execution timeouts
EXEC_TIMEOUT = 10.0          # seconds for code execution
COMPILE_TIMEOUT = 15.0       # seconds for compilation step
MAX_OUTPUT_CHARS = 10_000    # truncate huge outputs

def enable_memory_limit():
    """Limit memory to ~256MB on POSIX systems."""
    if os.name == "posix":
        try:
            import resource
            MEM_LIMIT = 256 * 1024 * 1024
            resource.setrlimit(resource.RLIMIT_AS, (MEM_LIMIT, MEM_LIMIT))
        except Exception:
            pass



def _truncate(text: str, limit: int = MAX_OUTPUT_CHARS) -> str:
    if len(text) > limit:
        return text[:limit] + f"\n... [output truncated at {limit} chars]"
    return text


@router.post("/run")
def run_code(req: CodeRequest, current_user: User = Depends(get_current_user)):
    """
    Execute user code securely.

    Supported languages: python, cpp, java
    Security measures:
      - subprocess timeout (10s execution, 15s compilation)
      - stdin piped from request
      - stdout/stderr truncated at 10 000 chars
      - Java: -Xmx128m memory cap
      - C++: compiled with -O2 optimisation
    """
    if req.language not in ["python", "cpp", "java", "c", "javascript"]:
        return {
            "stdout": "",
            "stderr": f"Language '{req.language}' is not supported. Use python, cpp, java, c, or javascript.",
            "output": f"Language '{req.language}' is not supported.",
            "status": "error",
            "execution_time_ms": 0,
        }

    start_time = time.time()
    stdin_data = req.stdin or ""

    try:
        with tempfile.TemporaryDirectory() as temp_dir:

            # ── Python ────────────────────────────────────────────────────────
            if req.language == "python":
                src_path = os.path.join(temp_dir, "script.py")
                with open(src_path, "w", encoding="utf-8") as f:
                    f.write(req.code)

                cmd = ["python", src_path] if os.name == "nt" else ["python3", src_path]
                result = subprocess.run(
                    cmd,
                    input=stdin_data,
                    capture_output=True,
                    text=True,
                    timeout=EXEC_TIMEOUT,
                    preexec_fn=enable_memory_limit if os.name == "posix" else None
                )

            # ── C ─────────────────────────────────────────────────────────────
            elif req.language == "c":
                src_path = os.path.join(temp_dir, "main.c")
                out_path = os.path.join(temp_dir, "a.exe" if os.name == "nt" else "a.out")
                with open(src_path, "w", encoding="utf-8") as f:
                    f.write(req.code)

                # Compile step
                compile_res = subprocess.run(
                    ["gcc", "-O2", src_path, "-o", out_path],
                    capture_output=True,
                    text=True,
                    timeout=COMPILE_TIMEOUT,
                )
                if compile_res.returncode != 0:
                    elapsed = int((time.time() - start_time) * 1000)
                    return {
                        "stdout": "",
                        "stderr": _truncate(compile_res.stderr),
                        "output": f"Compilation Error:\n{_truncate(compile_res.stderr)}",
                        "status": "compile_error",
                        "execution_time_ms": elapsed,
                    }

                result = subprocess.run(
                    [out_path],
                    input=stdin_data,
                    capture_output=True,
                    text=True,
                    timeout=EXEC_TIMEOUT,
                    preexec_fn=enable_memory_limit if os.name == "posix" else None
                )

            # ── C++ ───────────────────────────────────────────────────────────
            elif req.language == "cpp":
                src_path = os.path.join(temp_dir, "main.cpp")
                out_path = os.path.join(temp_dir, "a.exe" if os.name == "nt" else "a.out")
                with open(src_path, "w", encoding="utf-8") as f:
                    f.write(req.code)

                # Compile step
                compile_res = subprocess.run(
                    ["g++", "-O2", "-std=c++17", src_path, "-o", out_path],
                    capture_output=True,
                    text=True,
                    timeout=COMPILE_TIMEOUT,
                )
                if compile_res.returncode != 0:
                    elapsed = int((time.time() - start_time) * 1000)
                    return {
                        "stdout": "",
                        "stderr": _truncate(compile_res.stderr),
                        "output": f"Compilation Error:\n{_truncate(compile_res.stderr)}",
                        "status": "compile_error",
                        "execution_time_ms": elapsed,
                    }

                result = subprocess.run(
                    [out_path],
                    input=stdin_data,
                    capture_output=True,
                    text=True,
                    timeout=EXEC_TIMEOUT,
                    preexec_fn=enable_memory_limit if os.name == "posix" else None
                )

            # ── Java ──────────────────────────────────────────────────────────
            elif req.language == "java":
                src_path = os.path.join(temp_dir, "Main.java")
                with open(src_path, "w", encoding="utf-8") as f:
                    f.write(req.code)

                # Compile step
                compile_res = subprocess.run(
                    ["javac", src_path],
                    capture_output=True,
                    text=True,
                    timeout=COMPILE_TIMEOUT,
                )
                if compile_res.returncode != 0:
                    elapsed = int((time.time() - start_time) * 1000)
                    return {
                        "stdout": "",
                        "stderr": _truncate(compile_res.stderr),
                        "output": f"Compilation Error:\n{_truncate(compile_res.stderr)}",
                        "status": "compile_error",
                        "execution_time_ms": elapsed,
                    }

                result = subprocess.run(
                    ["java", "-Xmx128m", "-cp", temp_dir, "Main"],
                    input=stdin_data,
                    capture_output=True,
                    text=True,
                    timeout=EXEC_TIMEOUT,
                )

            # ── JavaScript ────────────────────────────────────────────────────
            elif req.language == "javascript":
                src_path = os.path.join(temp_dir, "script.js")
                with open(src_path, "w", encoding="utf-8") as f:
                    f.write(req.code)

                result = subprocess.run(
                    ["node", src_path],
                    input=stdin_data,
                    capture_output=True,
                    text=True,
                    timeout=EXEC_TIMEOUT,
                    preexec_fn=enable_memory_limit if os.name == "posix" else None
                )

            # ── Build response ────────────────────────────────────────────────
            execution_time_ms = int((time.time() - start_time) * 1000)
            stdout = _truncate(result.stdout or "")
            stderr = _truncate(result.stderr or "")

            # Combined output for legacy frontend consumers
            combined = stdout
            if stderr:
                combined += f"\nStderr:\n{stderr}"

            return {
                "stdout": stdout,
                "stderr": stderr,
                "output": combined or "(no output)",
                "status": "success" if result.returncode == 0 else "runtime_error",
                "execution_time_ms": execution_time_ms,
                "return_code": result.returncode,
            }

    except subprocess.TimeoutExpired:
        elapsed = int((time.time() - start_time) * 1000)
        return {
            "stdout": "",
            "stderr": f"Time limit exceeded ({EXEC_TIMEOUT}s). Check for infinite loops.",
            "output": f"⏱️ Time limit exceeded ({EXEC_TIMEOUT}s). Check for infinite loops.",
            "status": "timeout",
            "execution_time_ms": elapsed,
        }
    except FileNotFoundError as e:
        # Compiler/interpreter not installed on this machine
        tool = str(e)
        return {
            "stdout": "",
            "stderr": f"Runtime tool not found: {tool}",
            "output": f"❌ Required tool not found: {tool}. The server may not have this language installed.",
            "status": "error",
            "execution_time_ms": 0,
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": str(e),
            "output": f"Execution Error: {str(e)}",
            "status": "error",
            "execution_time_ms": int((time.time() - start_time) * 1000),
        }
@router.post("/explain")
def explain_code(req: CodeRequest, current_user: User = Depends(get_current_user)):
    """Use AI to explain the code or provide hints without giving the full solution."""
    prompt = f"""You are an elite coding tutor. Analyze this user's {req.language} code and provide a helpful, encouraging explanation.
        
Guidelines:
- Explain what the current code is doing.
- Point out potential bugs or inefficiencies.
- Provide a HINT or a PATH towards the solution, but DO NOT provide the full corrected code.
- Keep the response concise (max 3-4 paragraphs).
- Format with markdown.

User's Code:
```{req.language}
{req.code}
```
"""
    explanation = get_ai_response(prompt, force_model="complex_reasoning")
    status = "success" if "API key" not in explanation else "error"
    return {"explanation": explanation, "status": status}

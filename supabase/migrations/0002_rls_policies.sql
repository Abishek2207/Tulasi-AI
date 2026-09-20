-- Phase 6: Row Level Security (RLS) Policies

ALTER TABLE announcement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for announcement" ON announcement FOR SELECT USING (true);

ALTER TABLE apisource ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for apisource" ON apisource FOR SELECT USING (true);

ALTER TABLE coupon ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for coupon" ON coupon FOR SELECT USING (true);

ALTER TABLE dailychallenge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for dailychallenge" ON dailychallenge FOR SELECT USING (true);

ALTER TABLE hackathon ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for hackathon" ON hackathon FOR SELECT USING (true);

ALTER TABLE internship ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for internship" ON internship FOR SELECT USING (true);

ALTER TABLE invitecode ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for invitecode" ON invitecode FOR SELECT USING (true);

ALTER TABLE job ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for job" ON job FOR SELECT USING (true);

ALTER TABLE marketsnapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for marketsnapshot" ON marketsnapshot FOR SELECT USING (true);

ALTER TABLE otpcode ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for otpcode" ON otpcode FOR SELECT USING (true);

ALTER TABLE reward ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for reward" ON reward FOR SELECT USING (true);

ALTER TABLE skill ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for skill" ON skill FOR SELECT USING (true);

ALTER TABLE subscriptionplan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for subscriptionplan" ON subscriptionplan FOR SELECT USING (true);

ALTER TABLE user ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own user record" ON user FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own user record" ON user FOR UPDATE USING (auth.uid()::text = id::text);

ALTER TABLE activitylog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activitylog" ON activitylog FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own activitylog" ON activitylog FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own activitylog" ON activitylog FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own activitylog" ON activitylog FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE adminlog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for adminlog" ON adminlog FOR SELECT USING (true);

ALTER TABLE agentlog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own agentlog" ON agentlog FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own agentlog" ON agentlog FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own agentlog" ON agentlog FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own agentlog" ON agentlog FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE applicationtracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own applicationtracker" ON applicationtracker FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own applicationtracker" ON applicationtracker FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own applicationtracker" ON applicationtracker FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own applicationtracker" ON applicationtracker FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE careerintelligenceprofile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own careerintelligenceprofile" ON careerintelligenceprofile FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own careerintelligenceprofile" ON careerintelligenceprofile FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own careerintelligenceprofile" ON careerintelligenceprofile FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own careerintelligenceprofile" ON careerintelligenceprofile FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE careerintelligenceroadmap ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own careerintelligenceroadmap" ON careerintelligenceroadmap FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own careerintelligenceroadmap" ON careerintelligenceroadmap FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own careerintelligenceroadmap" ON careerintelligenceroadmap FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own careerintelligenceroadmap" ON careerintelligenceroadmap FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE certificate ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own certificate" ON certificate FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own certificate" ON certificate FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own certificate" ON certificate FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own certificate" ON certificate FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE chatmessage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chatmessage" ON chatmessage FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own chatmessage" ON chatmessage FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own chatmessage" ON chatmessage FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own chatmessage" ON chatmessage FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE chatrequest ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for chatrequest" ON chatrequest FOR SELECT USING (true);

ALTER TABLE chatsession ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chatsession" ON chatsession FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own chatsession" ON chatsession FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own chatsession" ON chatsession FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own chatsession" ON chatsession FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE couponredemption ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own couponredemption" ON couponredemption FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own couponredemption" ON couponredemption FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own couponredemption" ON couponredemption FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own couponredemption" ON couponredemption FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE dailychallengesubmission ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own dailychallengesubmission" ON dailychallengesubmission FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own dailychallengesubmission" ON dailychallengesubmission FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own dailychallengesubmission" ON dailychallengesubmission FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own dailychallengesubmission" ON dailychallengesubmission FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE directmessage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for directmessage" ON directmessage FOR SELECT USING (true);

ALTER TABLE document ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own document" ON document FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own document" ON document FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own document" ON document FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own document" ON document FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE goal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goal" ON goal FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own goal" ON goal FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own goal" ON goal FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own goal" ON goal FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE group ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for group" ON group FOR SELECT USING (true);

ALTER TABLE hackathonapplication ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own hackathonapplication" ON hackathonapplication FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own hackathonapplication" ON hackathonapplication FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own hackathonapplication" ON hackathonapplication FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own hackathonapplication" ON hackathonapplication FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE hackathonbookmark ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own hackathonbookmark" ON hackathonbookmark FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own hackathonbookmark" ON hackathonbookmark FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own hackathonbookmark" ON hackathonbookmark FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own hackathonbookmark" ON hackathonbookmark FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE idea ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own idea" ON idea FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own idea" ON idea FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own idea" ON idea FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own idea" ON idea FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE learningmemory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own learningmemory" ON learningmemory FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own learningmemory" ON learningmemory FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own learningmemory" ON learningmemory FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own learningmemory" ON learningmemory FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE learningplan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own learningplan" ON learningplan FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own learningplan" ON learningplan FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own learningplan" ON learningplan FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own learningplan" ON learningplan FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE mentorinsight ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own mentorinsight" ON mentorinsight FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own mentorinsight" ON mentorinsight FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own mentorinsight" ON mentorinsight FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own mentorinsight" ON mentorinsight FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE notification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notification" ON notification FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own notification" ON notification FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own notification" ON notification FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own notification" ON notification FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE payment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payment" ON payment FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own payment" ON payment FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own payment" ON payment FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own payment" ON payment FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE persistentinterviewsession ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own persistentinterviewsession" ON persistentinterviewsession FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own persistentinterviewsession" ON persistentinterviewsession FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own persistentinterviewsession" ON persistentinterviewsession FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own persistentinterviewsession" ON persistentinterviewsession FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE prepplan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own prepplan" ON prepplan FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own prepplan" ON prepplan FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own prepplan" ON prepplan FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own prepplan" ON prepplan FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profile FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own profile" ON profile FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own profile" ON profile FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own profile" ON profile FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE question ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own question" ON question FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own question" ON question FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own question" ON question FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own question" ON question FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE review ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own review" ON review FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own review" ON review FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own review" ON review FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own review" ON review FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE revisionschedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own revisionschedule" ON revisionschedule FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own revisionschedule" ON revisionschedule FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own revisionschedule" ON revisionschedule FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own revisionschedule" ON revisionschedule FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE roadmap ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roadmap" ON roadmap FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own roadmap" ON roadmap FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own roadmap" ON roadmap FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own roadmap" ON roadmap FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE roadmapitem ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roadmapitem" ON roadmapitem FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own roadmapitem" ON roadmapitem FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own roadmapitem" ON roadmapitem FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own roadmapitem" ON roadmapitem FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE savedresume ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own savedresume" ON savedresume FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own savedresume" ON savedresume FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own savedresume" ON savedresume FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own savedresume" ON savedresume FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE savedstartupidea ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own savedstartupidea" ON savedstartupidea FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own savedstartupidea" ON savedstartupidea FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own savedstartupidea" ON savedstartupidea FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own savedstartupidea" ON savedstartupidea FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE skillassessment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own skillassessment" ON skillassessment FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own skillassessment" ON skillassessment FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own skillassessment" ON skillassessment FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own skillassessment" ON skillassessment FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE skillmastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own skillmastery" ON skillmastery FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own skillmastery" ON skillmastery FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own skillmastery" ON skillmastery FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own skillmastery" ON skillmastery FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE solvedproblem ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own solvedproblem" ON solvedproblem FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own solvedproblem" ON solvedproblem FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own solvedproblem" ON solvedproblem FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own solvedproblem" ON solvedproblem FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE studyroom ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for studyroom" ON studyroom FOR SELECT USING (true);

ALTER TABLE usagelog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usagelog" ON usagelog FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own usagelog" ON usagelog FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own usagelog" ON usagelog FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own usagelog" ON usagelog FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE userbadge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own userbadge" ON userbadge FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own userbadge" ON userbadge FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own userbadge" ON userbadge FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own userbadge" ON userbadge FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE usercertification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usercertification" ON usercertification FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own usercertification" ON usercertification FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own usercertification" ON usercertification FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own usercertification" ON usercertification FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE userfeedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own userfeedback" ON userfeedback FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own userfeedback" ON userfeedback FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own userfeedback" ON userfeedback FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own userfeedback" ON userfeedback FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE userfollow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for userfollow" ON userfollow FOR SELECT USING (true);

ALTER TABLE usermemorychunk ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usermemorychunk" ON usermemorychunk FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own usermemorychunk" ON usermemorychunk FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own usermemorychunk" ON usermemorychunk FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own usermemorychunk" ON usermemorychunk FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE userprogress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own userprogress" ON userprogress FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own userprogress" ON userprogress FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own userprogress" ON userprogress FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own userprogress" ON userprogress FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE usersubscription ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usersubscription" ON usersubscription FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own usersubscription" ON usersubscription FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own usersubscription" ON usersubscription FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own usersubscription" ON usersubscription FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE atsreport ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own atsreport" ON atsreport FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own atsreport" ON atsreport FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own atsreport" ON atsreport FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own atsreport" ON atsreport FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE dailytask ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own dailytask" ON dailytask FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own dailytask" ON dailytask FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own dailytask" ON dailytask FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own dailytask" ON dailytask FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE documentchunk ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own documentchunk" ON documentchunk FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own documentchunk" ON documentchunk FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own documentchunk" ON documentchunk FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own documentchunk" ON documentchunk FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE documenttopic ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for documenttopic" ON documenttopic FOR SELECT USING (true);

ALTER TABLE groupmember ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own groupmember" ON groupmember FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own groupmember" ON groupmember FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own groupmember" ON groupmember FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own groupmember" ON groupmember FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE groupmessage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own groupmessage" ON groupmessage FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own groupmessage" ON groupmessage FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own groupmessage" ON groupmessage FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own groupmessage" ON groupmessage FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE ideacomment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ideacomment" ON ideacomment FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own ideacomment" ON ideacomment FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own ideacomment" ON ideacomment FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own ideacomment" ON ideacomment FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE idealike ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own idealike" ON idealike FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own idealike" ON idealike FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own idealike" ON idealike FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own idealike" ON idealike FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE questionattempt ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own questionattempt" ON questionattempt FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own questionattempt" ON questionattempt FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own questionattempt" ON questionattempt FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own questionattempt" ON questionattempt FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE roadmapstep ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for roadmapstep" ON roadmapstep FOR SELECT USING (true);

ALTER TABLE studyroommessage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own studyroommessage" ON studyroommessage FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own studyroommessage" ON studyroommessage FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own studyroommessage" ON studyroommessage FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own studyroommessage" ON studyroommessage FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE learningsession ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own learningsession" ON learningsession FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own learningsession" ON learningsession FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own learningsession" ON learningsession FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own learningsession" ON learningsession FOR DELETE USING (auth.uid()::text = user_id::text);

ALTER TABLE taskcompletion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own taskcompletion" ON taskcompletion FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own taskcompletion" ON taskcompletion FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own taskcompletion" ON taskcompletion FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own taskcompletion" ON taskcompletion FOR DELETE USING (auth.uid()::text = user_id::text);


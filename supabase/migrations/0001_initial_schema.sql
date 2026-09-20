-- Phase 6: Initial PostgreSQL Schema
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE announcement (
	id VARCHAR NOT NULL, 
	message VARCHAR NOT NULL, 
	type VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	expires_at TIMESTAMP WITHOUT TIME ZONE, 
	created_by VARCHAR NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE apisource (
	id SERIAL NOT NULL, 
	name VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	last_sync TIMESTAMP WITHOUT TIME ZONE, 
	error_message VARCHAR, 
	PRIMARY KEY (id)
);

CREATE TABLE coupon (
	id SERIAL NOT NULL, 
	code VARCHAR NOT NULL, 
	discount_percent INTEGER NOT NULL, 
	target_plan VARCHAR NOT NULL, 
	usage_limit INTEGER NOT NULL, 
	current_usage INTEGER NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE dailychallenge (
	id SERIAL NOT NULL, 
	date VARCHAR NOT NULL, 
	challenge_type VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	question VARCHAR NOT NULL, 
	difficulty VARCHAR NOT NULL, 
	xp_reward INTEGER NOT NULL, 
	tags VARCHAR NOT NULL, 
	hint VARCHAR, 
	sample_answer VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE hackathon (
	id SERIAL NOT NULL, 
	name VARCHAR NOT NULL, 
	organizer VARCHAR NOT NULL, 
	description VARCHAR NOT NULL, 
	prize VARCHAR NOT NULL, 
	prize_pool VARCHAR NOT NULL, 
	deadline VARCHAR NOT NULL, 
	link VARCHAR NOT NULL, 
	registration_link VARCHAR NOT NULL, 
	tags VARCHAR NOT NULL, 
	image_url VARCHAR NOT NULL, 
	participants_count INTEGER NOT NULL, 
	status VARCHAR NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	event_mode VARCHAR, 
	difficulty VARCHAR NOT NULL, 
	team_size VARCHAR NOT NULL, 
	start_date VARCHAR, 
	end_date VARCHAR, 
	registration_deadline VARCHAR, 
	domains VARCHAR NOT NULL, 
	currency VARCHAR NOT NULL, 
	location VARCHAR, 
	source_name VARCHAR, 
	source_url VARCHAR, 
	fetched_at TIMESTAMP WITHOUT TIME ZONE, 
	raw_payload VARCHAR, 
	verified_status VARCHAR NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE internship (
	id SERIAL NOT NULL, 
	title VARCHAR NOT NULL, 
	company VARCHAR NOT NULL, 
	domain VARCHAR NOT NULL, 
	type VARCHAR NOT NULL, 
	mode VARCHAR NOT NULL, 
	location VARCHAR, 
	stipend VARCHAR, 
	duration VARCHAR, 
	description VARCHAR, 
	apply_link VARCHAR NOT NULL, 
	deadline VARCHAR, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	source_name VARCHAR, 
	source_url VARCHAR, 
	fetched_at TIMESTAMP WITHOUT TIME ZONE, 
	raw_payload VARCHAR, 
	verified_status VARCHAR NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE invitecode (
	id SERIAL NOT NULL, 
	code VARCHAR NOT NULL, 
	usage_count INTEGER NOT NULL, 
	usage_limit INTEGER NOT NULL, 
	grants_pro BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	expires_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE job (
	id SERIAL NOT NULL, 
	source VARCHAR NOT NULL, 
	source_job_id VARCHAR, 
	title VARCHAR NOT NULL, 
	company VARCHAR NOT NULL, 
	location VARCHAR, 
	remote_type VARCHAR, 
	description VARCHAR, 
	skills VARCHAR, 
	experience_requirements VARCHAR, 
	salary_min INTEGER, 
	salary_max INTEGER, 
	salary_currency VARCHAR, 
	employment_type VARCHAR, 
	source_url VARCHAR, 
	posted_at VARCHAR, 
	fetched_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	content_hash VARCHAR NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE marketsnapshot (
	id SERIAL NOT NULL, 
	role VARCHAR NOT NULL, 
	location VARCHAR NOT NULL, 
	time_period VARCHAR NOT NULL, 
	jobs_analyzed INTEGER NOT NULL, 
	top_skills VARCHAR NOT NULL, 
	companies VARCHAR NOT NULL, 
	salary_signals VARCHAR NOT NULL, 
	demand_signals VARCHAR NOT NULL, 
	source_metadata VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE otpcode (
	id SERIAL NOT NULL, 
	email VARCHAR NOT NULL, 
	code VARCHAR NOT NULL, 
	expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE reward (
	id SERIAL NOT NULL, 
	name VARCHAR NOT NULL, 
	description VARCHAR NOT NULL, 
	cost_xp INTEGER NOT NULL, 
	image_url VARCHAR, 
	category VARCHAR NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE skill (
	id SERIAL NOT NULL, 
	name VARCHAR NOT NULL, 
	category VARCHAR NOT NULL, 
	parent_skill_id INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(parent_skill_id) REFERENCES skill (id)
);

CREATE TABLE subscriptionplan (
	id SERIAL NOT NULL, 
	name VARCHAR NOT NULL, 
	price INTEGER NOT NULL, 
	ai_requests_limit INTEGER NOT NULL, 
	resume_downloads_limit INTEGER NOT NULL, 
	features_json VARCHAR NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	PRIMARY KEY (id)
);

CREATE TABLE "user" (
	id SERIAL NOT NULL, 
	username VARCHAR, 
	email VARCHAR NOT NULL, 
	hashed_password VARCHAR, 
	name VARCHAR NOT NULL, 
	bio VARCHAR, 
	skills VARCHAR, 
	avatar VARCHAR, 
	role VARCHAR NOT NULL, 
	provider VARCHAR NOT NULL, 
	preferred_model VARCHAR NOT NULL, 
	invite_code VARCHAR, 
	referred_by VARCHAR, 
	streak INTEGER NOT NULL, 
	longest_streak INTEGER NOT NULL, 
	xp INTEGER NOT NULL, 
	level INTEGER NOT NULL, 
	last_activity_date VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	last_seen TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	is_pro BOOLEAN NOT NULL, 
	is_private BOOLEAN NOT NULL, 
	stripe_customer_id VARCHAR, 
	stripe_subscription_id VARCHAR, 
	chats_today INTEGER NOT NULL, 
	last_reset_date VARCHAR, 
	pro_expiry_date VARCHAR, 
	user_type VARCHAR NOT NULL, 
	abuse_count INTEGER NOT NULL, 
	is_onboarded BOOLEAN NOT NULL, 
	department VARCHAR, 
	target_role VARCHAR, 
	target_companies VARCHAR, 
	interest_areas VARCHAR, 
	onboarding_step INTEGER NOT NULL, 
	user_intelligence_profile VARCHAR, 
	last_intelligence_update TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	behavioral_patterns VARCHAR, 
	PRIMARY KEY (id)
);

CREATE TABLE activitylog (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	action_type VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	metadata_json VARCHAR, 
	xp_earned INTEGER NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE adminlog (
	id SERIAL NOT NULL, 
	admin_id INTEGER NOT NULL, 
	action VARCHAR NOT NULL, 
	target_user_id INTEGER, 
	timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(admin_id) REFERENCES "user" (id)
);

CREATE TABLE agentlog (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	agent_name VARCHAR NOT NULL, 
	action VARCHAR NOT NULL, 
	data_source VARCHAR, 
	confidence INTEGER, 
	timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE applicationtracker (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	company VARCHAR NOT NULL, 
	role VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	applied_date VARCHAR NOT NULL, 
	source_url VARCHAR, 
	notes VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE careerintelligenceprofile (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	career_stage VARCHAR NOT NULL, 
	full_name VARCHAR NOT NULL, 
	institution VARCHAR, 
	degree VARCHAR, 
	graduation_year INTEGER, 
	field VARCHAR, 
	"current_role" VARCHAR, 
	target_role VARCHAR, 
	company VARCHAR, 
	experience_years INTEGER, 
	experience_level VARCHAR, 
	current_skills VARCHAR, 
	current_salary VARCHAR, 
	target_salary VARCHAR, 
	career_goal VARCHAR, 
	daily_time_minutes INTEGER NOT NULL, 
	learning_days VARCHAR NOT NULL, 
	onboarding_completed BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE careerintelligenceroadmap (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	roadmap_data VARCHAR, 
	estimated_months_to_goal INTEGER, 
	readiness_score INTEGER NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE certificate (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	title VARCHAR NOT NULL, 
	issuer VARCHAR NOT NULL, 
	cert_type VARCHAR NOT NULL, 
	file_path VARCHAR, 
	issued_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE chatmessage (
	id SERIAL NOT NULL, 
	session_id VARCHAR NOT NULL, 
	user_id INTEGER, 
	role VARCHAR NOT NULL, 
	content VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE chatrequest (
	id SERIAL NOT NULL, 
	sender_id INTEGER NOT NULL, 
	receiver_id INTEGER NOT NULL, 
	status VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(sender_id) REFERENCES "user" (id), 
	FOREIGN KEY(receiver_id) REFERENCES "user" (id)
);

CREATE TABLE chatsession (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	session_id VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE couponredemption (
	id SERIAL NOT NULL, 
	coupon_id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	redeemed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(coupon_id) REFERENCES coupon (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE dailychallengesubmission (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	challenge_id INTEGER NOT NULL, 
	date VARCHAR NOT NULL, 
	answer VARCHAR NOT NULL, 
	score INTEGER NOT NULL, 
	ai_feedback VARCHAR NOT NULL, 
	strengths VARCHAR NOT NULL, 
	improvements VARCHAR NOT NULL, 
	xp_awarded INTEGER NOT NULL, 
	completed BOOLEAN NOT NULL, 
	submitted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id), 
	FOREIGN KEY(challenge_id) REFERENCES dailychallenge (id)
);

CREATE TABLE directmessage (
	id SERIAL NOT NULL, 
	sender_id INTEGER NOT NULL, 
	receiver_id INTEGER NOT NULL, 
	content VARCHAR NOT NULL, 
	media_type VARCHAR, 
	media_url VARCHAR, 
	reactions_json VARCHAR NOT NULL, 
	reply_to_id INTEGER, 
	is_seen BOOLEAN NOT NULL, 
	seen_at TIMESTAMP WITHOUT TIME ZONE, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(sender_id) REFERENCES "user" (id), 
	FOREIGN KEY(receiver_id) REFERENCES "user" (id), 
	FOREIGN KEY(reply_to_id) REFERENCES directmessage (id)
);

CREATE TABLE document (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	title VARCHAR NOT NULL, 
	filename VARCHAR NOT NULL, 
	file_path VARCHAR NOT NULL, 
	file_size_bytes INTEGER NOT NULL, 
	page_count INTEGER NOT NULL, 
	status VARCHAR NOT NULL, 
	error_message VARCHAR, 
	analysis_result VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE goal (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	goal VARCHAR NOT NULL, 
	priority VARCHAR NOT NULL, 
	deadline TIMESTAMP WITHOUT TIME ZONE, 
	target_role VARCHAR, 
	target_salary VARCHAR, 
	target_companies VARCHAR, 
	location VARCHAR, 
	daily_minutes INTEGER NOT NULL, 
	preferred_days VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE "group" (
	id SERIAL NOT NULL, 
	name VARCHAR NOT NULL, 
	description VARCHAR NOT NULL, 
	join_code VARCHAR NOT NULL, 
	created_by INTEGER NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(created_by) REFERENCES "user" (id)
);

CREATE TABLE hackathonapplication (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	hackathon_id INTEGER NOT NULL, 
	status VARCHAR NOT NULL, 
	applied_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id), 
	FOREIGN KEY(hackathon_id) REFERENCES hackathon (id)
);

CREATE TABLE hackathonbookmark (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	hackathon_id INTEGER NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id), 
	FOREIGN KEY(hackathon_id) REFERENCES hackathon (id)
);

CREATE TABLE idea (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	content VARCHAR NOT NULL, 
	tags VARCHAR NOT NULL, 
	likes_count INTEGER NOT NULL, 
	comments_count INTEGER NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE learningmemory (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	topic VARCHAR NOT NULL, 
	mastery_level INTEGER NOT NULL, 
	attempts_count INTEGER NOT NULL, 
	correct_count INTEGER NOT NULL, 
	wrong_count INTEGER NOT NULL, 
	last_practiced_at TIMESTAMP WITHOUT TIME ZONE, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE learningplan (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	title VARCHAR NOT NULL, 
	target_role VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE mentorinsight (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	context_type VARCHAR NOT NULL, 
	insight_text VARCHAR NOT NULL, 
	is_read BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE notification (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	title VARCHAR NOT NULL, 
	message VARCHAR NOT NULL, 
	category VARCHAR NOT NULL, 
	is_read BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	role_context VARCHAR NOT NULL, 
	summary VARCHAR NOT NULL, 
	impact_level VARCHAR NOT NULL, 
	source_tech VARCHAR NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE payment (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	amount FLOAT NOT NULL, 
	currency VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	razorpay_payment_id VARCHAR, 
	razorpay_order_id VARCHAR, 
	razorpay_signature VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE persistentinterviewsession (
	id SERIAL NOT NULL, 
	session_id VARCHAR NOT NULL, 
	user_id INTEGER NOT NULL, 
	role VARCHAR NOT NULL, 
	company VARCHAR NOT NULL, 
	interview_type VARCHAR NOT NULL, 
	num_questions INTEGER NOT NULL, 
	questions_asked INTEGER NOT NULL, 
	history_json VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	feedback_json VARCHAR, 
	scores_json VARCHAR NOT NULL, 
	current_difficulty INTEGER NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE prepplan (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	role VARCHAR NOT NULL, 
	duration VARCHAR NOT NULL, 
	plan_json VARCHAR NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE profile (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	"current_role" VARCHAR, 
	company VARCHAR, 
	experience_years INTEGER, 
	skill_level VARCHAR, 
	ai_mentor_name VARCHAR, 
	skills VARCHAR, 
	learning_hours_per_day INTEGER, 
	student_year VARCHAR, 
	student_goal VARCHAR, 
	current_salary_range VARCHAR, 
	target_salary_goal VARCHAR, 
	daily_available_hours VARCHAR, 
	available_days VARCHAR, 
	placement_goal VARCHAR, 
	preferred_companies VARCHAR, 
	weak_areas VARCHAR, 
	resume_status VARCHAR, 
	existing_projects VARCHAR, 
	current_package_range_prof VARCHAR, 
	target_package VARCHAR, 
	industry VARCHAR, 
	career_goal VARCHAR, 
	tools_used VARCHAR, 
	ai_tools_known VARCHAR, 
	college_name VARCHAR, 
	degree VARCHAR, 
	department VARCHAR, 
	year_of_study VARCHAR, 
	target_role VARCHAR, 
	current_skills VARCHAR, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (user_id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE question (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	topic VARCHAR NOT NULL, 
	content VARCHAR NOT NULL, 
	difficulty INTEGER NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE review (
	id SERIAL NOT NULL, 
	user_id INTEGER, 
	name VARCHAR NOT NULL, 
	email VARCHAR, 
	role VARCHAR, 
	review VARCHAR NOT NULL, 
	rating INTEGER NOT NULL, 
	is_featured BOOLEAN NOT NULL, 
	is_approved BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE revisionschedule (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	topic VARCHAR NOT NULL, 
	last_studied TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	last_tested TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	score FLOAT NOT NULL, 
	mastery FLOAT NOT NULL, 
	confidence FLOAT NOT NULL, 
	next_review TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE roadmap (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	goal VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	description VARCHAR NOT NULL, 
	estimated_months INTEGER NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE roadmapitem (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	roadmap_type VARCHAR NOT NULL, 
	day_number INTEGER NOT NULL, 
	title VARCHAR NOT NULL, 
	description VARCHAR NOT NULL, 
	estimated_time INTEGER NOT NULL, 
	status VARCHAR NOT NULL, 
	due_date VARCHAR, 
	skill_category VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE savedresume (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	is_deleted BOOLEAN NOT NULL, 
	resume_mode VARCHAR, 
	document_type VARCHAR NOT NULL, 
	original_resume VARCHAR NOT NULL, 
	job_description VARCHAR NOT NULL, 
	improved_resume VARCHAR NOT NULL, 
	ats_score INTEGER NOT NULL, 
	readability_score INTEGER NOT NULL, 
	keyword_match_percent INTEGER NOT NULL, 
	feedback_json VARCHAR NOT NULL, 
	missing_keywords_json VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE savedstartupidea (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	name VARCHAR NOT NULL, 
	problem VARCHAR NOT NULL, 
	solution VARCHAR NOT NULL, 
	market_opportunity VARCHAR NOT NULL, 
	tech_stack VARCHAR NOT NULL, 
	monetization VARCHAR NOT NULL, 
	domain VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE skillassessment (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	skill_name VARCHAR NOT NULL, 
	mastery_level VARCHAR NOT NULL, 
	confidence FLOAT NOT NULL, 
	evidence VARCHAR NOT NULL, 
	last_assessed TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	next_review TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE skillmastery (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	skill_name VARCHAR NOT NULL, 
	mastery_score FLOAT NOT NULL, 
	topics_completed INTEGER NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE solvedproblem (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	problem_id VARCHAR NOT NULL, 
	solved_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE studyroom (
	id SERIAL NOT NULL, 
	name VARCHAR NOT NULL, 
	description VARCHAR NOT NULL, 
	tag VARCHAR NOT NULL, 
	color VARCHAR NOT NULL, 
	created_by INTEGER NOT NULL, 
	is_public BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(created_by) REFERENCES "user" (id)
);

CREATE TABLE usagelog (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	action_type VARCHAR NOT NULL, 
	timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	details VARCHAR, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE userbadge (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	name VARCHAR NOT NULL, 
	description VARCHAR NOT NULL, 
	icon VARCHAR NOT NULL, 
	earned_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE usercertification (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	title VARCHAR NOT NULL, 
	provider VARCHAR NOT NULL, 
	skill_category VARCHAR NOT NULL, 
	difficulty VARCHAR NOT NULL, 
	estimated_time VARCHAR NOT NULL, 
	external_url VARCHAR NOT NULL, 
	status VARCHAR NOT NULL, 
	study_path_json VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE userfeedback (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	message_id VARCHAR NOT NULL, 
	rating INTEGER NOT NULL, 
	context VARCHAR NOT NULL, 
	expected_better VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE userfollow (
	id SERIAL NOT NULL, 
	follower_id INTEGER NOT NULL, 
	following_id INTEGER NOT NULL, 
	status VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(follower_id) REFERENCES "user" (id), 
	FOREIGN KEY(following_id) REFERENCES "user" (id)
);

CREATE TABLE usermemorychunk (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	content VARCHAR NOT NULL, 
	embedding VECTOR(768), 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE userprogress (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	category VARCHAR NOT NULL, 
	total_items INTEGER NOT NULL, 
	completed_items INTEGER NOT NULL, 
	progress_pct INTEGER NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE usersubscription (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	plan_id INTEGER NOT NULL, 
	status VARCHAR NOT NULL, 
	start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	end_date TIMESTAMP WITHOUT TIME ZONE, 
	razorpay_subscription_id VARCHAR, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id), 
	FOREIGN KEY(plan_id) REFERENCES subscriptionplan (id)
);

CREATE TABLE atsreport (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	resume_id INTEGER NOT NULL, 
	overall_score INTEGER NOT NULL, 
	keyword_match_score INTEGER NOT NULL, 
	skills_score INTEGER NOT NULL, 
	experience_score INTEGER NOT NULL, 
	formatting_score INTEGER NOT NULL, 
	missing_keywords_json VARCHAR NOT NULL, 
	skill_gap_analysis VARCHAR NOT NULL, 
	improvement_suggestions_json VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id), 
	FOREIGN KEY(resume_id) REFERENCES savedresume (id)
);

CREATE TABLE dailytask (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	learning_plan_id INTEGER, 
	date_assigned VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	description VARCHAR NOT NULL, 
	task_type VARCHAR NOT NULL, 
	estimated_minutes INTEGER NOT NULL, 
	status VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id), 
	FOREIGN KEY(learning_plan_id) REFERENCES learningplan (id)
);

CREATE TABLE documentchunk (
	id SERIAL NOT NULL, 
	document_id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	page_number INTEGER NOT NULL, 
	chunk_index INTEGER NOT NULL, 
	content VARCHAR NOT NULL, 
	embedding VECTOR(768), 
	metadata_json VARCHAR, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(document_id) REFERENCES document (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE documenttopic (
	id SERIAL NOT NULL, 
	document_id INTEGER NOT NULL, 
	topic_name VARCHAR NOT NULL, 
	confidence FLOAT NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(document_id) REFERENCES document (id)
);

CREATE TABLE groupmember (
	id SERIAL NOT NULL, 
	group_id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	user_name VARCHAR NOT NULL, 
	joined_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(group_id) REFERENCES "group" (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE groupmessage (
	id SERIAL NOT NULL, 
	group_id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	user_name VARCHAR NOT NULL, 
	content VARCHAR NOT NULL, 
	is_encrypted BOOLEAN NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(group_id) REFERENCES "group" (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE ideacomment (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	idea_id INTEGER NOT NULL, 
	content VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id), 
	FOREIGN KEY(idea_id) REFERENCES idea (id)
);

CREATE TABLE idealike (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	idea_id INTEGER NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id), 
	FOREIGN KEY(idea_id) REFERENCES idea (id)
);

CREATE TABLE questionattempt (
	id SERIAL NOT NULL, 
	question_id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	user_answer VARCHAR NOT NULL, 
	ai_score INTEGER NOT NULL, 
	ai_feedback VARCHAR NOT NULL, 
	attempted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(question_id) REFERENCES question (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE roadmapstep (
	id SERIAL NOT NULL, 
	roadmap_id INTEGER NOT NULL, 
	phase VARCHAR NOT NULL, 
	title VARCHAR NOT NULL, 
	duration VARCHAR NOT NULL, 
	topics_json VARCHAR NOT NULL, 
	project_idea VARCHAR NOT NULL, 
	resources_json VARCHAR NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(roadmap_id) REFERENCES roadmap (id)
);

CREATE TABLE studyroommessage (
	id SERIAL NOT NULL, 
	room_id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	user_name VARCHAR NOT NULL, 
	content VARCHAR NOT NULL, 
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(room_id) REFERENCES studyroom (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);

CREATE TABLE learningsession (
	id SERIAL NOT NULL, 
	user_id INTEGER NOT NULL, 
	task_id INTEGER, 
	started_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	ended_at TIMESTAMP WITHOUT TIME ZONE, 
	duration_minutes INTEGER NOT NULL, 
	status VARCHAR NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id), 
	FOREIGN KEY(task_id) REFERENCES dailytask (id)
);

CREATE TABLE taskcompletion (
	id SERIAL NOT NULL, 
	task_id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	completed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
	time_spent_minutes INTEGER NOT NULL, 
	difficulty_rating INTEGER NOT NULL, 
	notes VARCHAR, 
	was_adapted BOOLEAN NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(task_id) REFERENCES dailytask (id), 
	FOREIGN KEY(user_id) REFERENCES "user" (id)
);


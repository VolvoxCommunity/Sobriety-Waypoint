/*
  # Seed Content: 12 Steps and Task Templates

  This migration populates:
  - The 12 Steps educational content
  - Default task templates for each step
*/

-- =============================================================================
-- 12 Steps Content
-- =============================================================================

INSERT INTO public.steps_content (step_number, title, description, detailed_content, reflection_prompts)
VALUES
  (1,
   'We admitted we were powerless over alcohol—that our lives had become unmanageable.',
   'Step One is about accepting the reality of our situation with alcohol and admitting that we need help.',
   'Step One is the foundation of recovery. It requires us to face the truth about our relationship with alcohol and acknowledge that we have lost control. This step is about honesty with ourselves. We recognize that our attempts to control our drinking have failed and that our lives have become chaotic and unmanageable as a result. Powerlessness means that alcohol has power over us, not that we are powerless people. Accepting this truth opens the door to change and allows us to seek help from others and a higher power. This step is often the hardest because it requires letting go of denial and facing painful realities.',
   '["What specific examples show that I was powerless over alcohol?", "In what ways has my life become unmanageable?", "What was I unable to control when it came to drinking?", "How has denial kept me from seeing the truth?", "What am I willing to do differently now?"]'::jsonb),

  (2,
   'Came to believe that a Power greater than ourselves could restore us to sanity.',
   'Step Two is about finding hope and opening ourselves to the possibility of healing through a power greater than ourselves.',
   'Step Two introduces the concept of hope and restoration. After admitting powerlessness in Step One, we now acknowledge that help is available from a source greater than ourselves. This "Power greater than ourselves" can be God as we understand God, the group, nature, or any concept of a loving, caring force. The key is recognizing that we cannot recover alone through willpower. "Restore us to sanity" refers to the insane thinking and behavior patterns that characterized our drinking. We acted against our own best interests repeatedly. This step asks us to be open-minded and willing to believe that healing is possible, even if we don''t fully understand how.',
   '["What does a Higher Power mean to me?", "What evidence do I have that a power greater than myself could help me?", "In what ways was my behavior insane when I was drinking?", "What gives me hope for recovery?", "Am I willing to be open to new ideas about spirituality?"]'::jsonb),

  (3,
   'Made a decision to turn our will and our lives over to the care of God as we understood Him.',
   'Step Three is about making a conscious decision to trust and let go, allowing a Higher Power to guide our lives.',
   'Step Three is the decision step. After recognizing our powerlessness (Step 1) and coming to believe help is available (Step 2), we now make a conscious choice to turn our lives over to the care of a Higher Power. This is not about religious dogma but about trust and surrender. "Turning it over" means releasing our need to control everything and trusting that a loving Higher Power will guide us. This includes our will (thoughts, decisions) and our lives (actions, circumstances). The phrase "as we understood Him" emphasizes that this is a personal understanding, not imposed by others. This step requires courage because it means letting go of self-will, which has often led us astray.',
   '["What does it mean to me to turn my will and life over?", "What am I afraid of losing if I surrender control?", "How has self-will caused problems in my life?", "What would change if I truly trusted a Higher Power?", "Am I ready to make this decision?"]'::jsonb),

  (4,
   'Made a searching and fearless moral inventory of ourselves.',
   'Step Four involves taking an honest look at ourselves, examining our behaviors, character defects, and the harm we have caused.',
   'Step Four is the inventory step. This is a written process where we examine our entire lives with rigorous honesty. We look at our resentments, fears, harms to others, and our part in these situations. A moral inventory is like a business inventory—we take stock of what we have. We examine both our defects (selfishness, dishonesty, fear, inconsiderate behavior) and our assets. The inventory should be "searching" (thorough) and "fearless" (honest, without holding back). This is not about blame or shame; it''s about understanding patterns that have kept us sick. We typically write about people we resent, why we resent them, how it affected us, and our part in the situation. This step helps us see ourselves clearly, often for the first time.',
   '["What resentments have I been holding onto?", "What fears have controlled my decisions?", "What harm have I caused to others?", "What character defects keep appearing in my inventory?", "What strengths and positive qualities do I have?"]'::jsonb),

  (5,
   'Admitted to God, to ourselves, and to another human being the exact nature of our wrongs.',
   'Step Five is about sharing our inventory with another person, releasing shame and secrets through honest disclosure.',
   'Step Five is the confession step. After writing our inventory in Step 4, we now share it with God (our Higher Power), ourselves, and another trusted person—usually a sponsor. This step breaks the power of secrets and shame. When we speak our wrongs out loud to another person, we often gain new insights and perspective. The listener helps us see patterns we might have missed and offers acceptance despite our mistakes. "The exact nature of our wrongs" means we don''t just list what we did, but examine why we did it—the character defects and fears that drove our behavior. This step is incredibly freeing. Many people report feeling lighter, cleaner, and more honest after completing their Fifth Step. It builds intimacy with others and with our Higher Power.',
   '["What am I most afraid to share in my Fifth Step?", "What patterns do I notice in my Fourth Step inventory?", "How has keeping secrets affected my life?", "Who would be a good person to hear my Fifth Step?", "What do I hope to gain from this step?"]'::jsonb),

  (6,
   'Were entirely ready to have God remove all these defects of character.',
   'Step Six is about willingness—becoming ready to let go of the character defects that have caused problems in our lives.',
   'Step Six is the willingness step. After identifying our character defects in Steps 4 and 5, we now prepare to release them. This step asks if we are "entirely ready" to have these defects removed. Many of us have mixed feelings—we know these defects hurt us, but they have also served us in some way (protecting us from hurt, giving us control, etc.). Step 6 is about becoming willing to change, even when it feels uncomfortable. We don''t remove the defects ourselves—that''s the job of our Higher Power. Our job is to become ready and willing. This often involves time, prayer, and meditation. We examine why we might want to hold onto certain defects. Perfect readiness isn''t required, but willingness is essential. This step prepares us for the action of Step 7.',
   '["Which character defects am I most ready to release?", "Which defects am I reluctant to let go of, and why?", "How have my defects protected me or served me?", "What would my life look like without these defects?", "Am I willing to become willing?"]'::jsonb),

  (7,
   'Humbly asked Him to remove our shortcomings.',
   'Step Seven is about humility and asking our Higher Power to remove the defects we have identified and become willing to release.',
   'Step Seven is the action step where we humbly ask our Higher Power to remove our shortcomings. The key word is "humbly"—this means having a realistic view of ourselves, neither inflated nor deflated. We acknowledge that we cannot remove these defects through willpower alone; we need help. This step is a prayer, a request for change. We ask our Higher Power to remove specific shortcomings and to help us develop their opposite virtues (courage to replace fear, honesty to replace dishonesty, etc.). This is not a one-time event but an ongoing practice. We may need to ask repeatedly, and we must be willing to take action when opportunities arise to practice new behaviors. The removal of defects is often gradual, not instantaneous. We learn to watch for these defects in our daily lives and ask for help in the moment.',
   '["What specific shortcomings do I want removed?", "How will I practice humility in asking for help?", "What virtues do I want to develop in place of my defects?", "Am I willing to take action when opportunities to change arise?", "How will I know when my character is changing?"]'::jsonb),

  (8,
   'Made a list of all persons we had harmed, and became willing to make amends to them all.',
   'Step Eight is about identifying everyone we have hurt and cultivating the willingness to repair those relationships.',
   'Step Eight is the preparation step for making amends. We make a list of every person we have harmed through our drinking and behavior. This includes family, friends, employers, strangers, and ourselves. We examine how we hurt these people (financially, emotionally, physically, spiritually). The second part of this step is becoming willing to make amends to all of them—even those we dislike or who have hurt us. Willingness is crucial. We may want to skip certain people or make excuses, but this step asks for complete willingness. We don''t make the amends yet; we just prepare our hearts and minds. Some amends will be easy, others terrifying. We talk with our sponsor about each person on our list. This step builds on the self-knowledge gained in earlier steps and sets the stage for healing relationships.',
   '["Who have I harmed through my drinking and behavior?", "What specific harms did I cause to each person?", "Which amends am I most resistant to making, and why?", "Am I willing to make amends even to people I don''t like?", "How has my unwillingness to make amends kept me stuck?"]'::jsonb),

  (9,
   'Made direct amends to such people wherever possible, except when to do so would injure them or others.',
   'Step Nine is about taking action to repair the harm we have caused, making direct amends wherever possible and safe.',
   'Step Nine is the amends step. We now take action on the list we created in Step 8. "Direct amends" means face-to-face whenever possible, admitting our wrongdoing and offering to make things right. This might involve repaying money, apologizing sincerely, or changing our behavior. We make amends to repair the harm we caused, not to make ourselves feel better. The exception clause is important: we don''t make amends if doing so would cause more harm to the person or others. For example, we wouldn''t confess an affair if it would devastate a spouse who has moved on. We discuss each amend with our sponsor to ensure we''re not being selfish or causing more harm. Some amends are living amends—changed behavior over time. This step requires courage and humility. The results are often miraculous: relationships heal, guilt lifts, and we become responsible people.',
   '["Which amends can I make right away?", "Which amends might cause more harm and should not be made?", "What do I need to say in each amends?", "How will I handle it if someone rejects my amends?", "What living amends do I need to make through changed behavior?"]'::jsonb),

  (10,
   'Continued to take personal inventory and when we were wrong promptly admitted it.',
   'Step Ten is about maintaining our recovery through daily self-examination and quickly correcting our mistakes.',
   'Step Ten is the maintenance step. It asks us to continue the inventory process from Step 4 on a daily basis. We watch for selfishness, dishonesty, resentment, and fear. When these arise, we ask our Higher Power to remove them and quickly make amends if we have harmed someone. "Promptly admitted it" means we don''t let wrongs pile up; we address them quickly. This keeps us clean and current in our relationships. Many people do a nightly inventory, reviewing their day and noting where they were right or wrong. When wrong, we admit it quickly—to ourselves, our Higher Power, and the person we harmed. When right, we gratefully acknowledge it without pride. This step keeps us in fit spiritual condition and prevents the buildup of resentments and guilt that could lead to relapse. It''s a tool for daily living.',
   '["What method will I use for my daily inventory?", "Where was I selfish, dishonest, resentful, or afraid today?", "What amends do I need to make from today?", "What did I do well today?", "How can I do better tomorrow?"]'::jsonb),

  (11,
   'Sought through prayer and meditation to improve our conscious contact with God as we understood Him, praying only for knowledge of His will for us and the power to carry that out.',
   'Step Eleven is about deepening our spiritual life through prayer and meditation, seeking guidance and strength from our Higher Power.',
   'Step Eleven is the spiritual step. It asks us to develop a daily practice of prayer (talking to our Higher Power) and meditation (listening to our Higher Power). The goal is to improve our "conscious contact"—our awareness of and connection to our Higher Power throughout the day. We pray for knowledge of our Higher Power''s will for us (what we should do) and the power to carry it out (the strength to do it). This is not about praying for things we want, but about aligning our will with our Higher Power''s will. Many people have a morning practice of meditation, prayer, and reading, and an evening practice of inventory and gratitude. This step provides the spiritual fuel for our daily lives. Regular practice brings peace, clarity, and guidance. We learn to pause during the day and ask for help or direction.',
   '["What does prayer mean to me?", "What does meditation mean to me?", "What is my current spiritual practice?", "How can I improve my conscious contact with my Higher Power?", "What is my Higher Power''s will for me today?"]'::jsonb),

  (12,
   'Having had a spiritual awakening as the result of these steps, we tried to carry this message to alcoholics, and to practice these principles in all our affairs.',
   'Step Twelve is about service—sharing our recovery with others and living according to spiritual principles in all areas of life.',
   'Step Twelve is the service step. It has three parts. First, we acknowledge that we have had a "spiritual awakening"—a profound change in our lives through working the steps. This awakening might be sudden or gradual, but it represents a fundamental shift in how we see ourselves, others, and our Higher Power. Second, we "carry this message to alcoholics"—we share our experience, strength, and hope with others who are still suffering. This might mean sponsoring others, speaking at meetings, or simply being available to help. Service keeps us sober and gives our lives meaning. Third, we "practice these principles in all our affairs"—we apply honesty, humility, acceptance, service, and other spiritual principles to every area of life: work, family, finances, relationships. Step 12 is not the end but the beginning of a new way of living. Recovery is an ongoing process of growth.',
   '["What spiritual awakening have I experienced?", "How has my life changed through working the steps?", "How can I carry the message to others who are suffering?", "What spiritual principles have I learned?", "How can I practice these principles in all my affairs?"]'::jsonb)
ON CONFLICT (step_number) DO NOTHING;

-- =============================================================================
-- Task Templates
-- =============================================================================

INSERT INTO public.task_templates (step_number, title, description, is_default) VALUES
  -- Step 1
  (1, 'Write Your Story', 'Write about the first time you realized you had a problem with alcohol. Describe specific situations where you felt powerless.', true),
  (1, 'List Examples of Powerlessness', 'Make a list of at least 5 specific examples where alcohol made your life unmanageable.', true),
  (1, 'Reflect on Consequences', 'Journal about the consequences you''ve faced due to drinking. Include relationships, work, health, and finances.', true),

  -- Step 2
  (2, 'Define Your Higher Power', 'Write about what a Higher Power means to you. This can be God, nature, the group, or any power greater than yourself.', true),
  (2, 'Reflect on Past Attempts', 'List all the times you tried to control your drinking on your own. What was the result?', true),
  (2, 'Write About Hope', 'Describe moments where you''ve seen others recover. What gives you hope that you can recover too?', true),

  -- Step 3
  (3, 'Write a Decision Statement', 'Write a personal statement declaring your decision to turn your will and life over to your Higher Power.', true),
  (3, 'Identify What You''re Surrendering', 'List specific areas of your life where you''ve been trying to control outcomes. What are you willing to surrender?', true),
  (3, 'Daily Prayer Practice', 'Establish a daily prayer or meditation practice. Record your thoughts each day for one week.', true),

  -- Step 4
  (4, 'Resentment Inventory', 'List all your resentments. For each one, identify who/what, what happened, what part of you was affected, and your role in it.', true),
  (4, 'Fear Inventory', 'Write about your fears. What are you afraid of? How have these fears controlled your behavior?', true),
  (4, 'Sexual Conduct Inventory', 'Reflect on your sexual conduct. Where have you been selfish, dishonest, or hurtful to others?', true),
  (4, 'Character Defects List', 'Identify patterns in your behavior. What character defects keep showing up in your life?', true),

  -- Step 5
  (5, 'Prepare for Fifth Step', 'Review your Fourth Step inventory thoroughly. Organize your thoughts and prepare to share with your sponsor.', true),
  (5, 'Schedule Fifth Step Meeting', 'Set a time and place to meet with your sponsor to complete your Fifth Step. Allow several uninterrupted hours.', true),
  (5, 'Post-Fifth Step Reflection', 'After completing your Fifth Step, write about how you feel. What insights did you gain? What relief do you feel?', true),

  -- Step 6
  (6, 'Review Character Defects', 'List all the character defects you identified in Step 4. Are you willing to have them removed?', true),
  (6, 'Identify Reluctance', 'Write about any defects you''re reluctant to let go of. Why? What would life be like without them?', true),
  (6, 'Prayer for Willingness', 'Write a prayer asking your Higher Power to make you willing to have your defects removed.', true),

  -- Step 7
  (7, 'Write Step Seven Prayer', 'Write your own version of the Step Seven prayer, asking your Higher Power to remove your shortcomings.', true),
  (7, 'Practice Humility', 'Identify three ways you can practice humility this week. Report back on your experience.', true),
  (7, 'Daily Shortcoming Check', 'Each day for one week, review your behavior. Note when shortcomings appear and pray for their removal.', true),

  -- Step 8
  (8, 'Create Amends List', 'Make a comprehensive list of everyone you''ve harmed. Include what you did and how it affected them.', true),
  (8, 'Explore Your Willingness', 'For each person on your list, write about your willingness to make amends. What hesitations do you have?', true),
  (8, 'Consider Delayed Amends', 'Identify any amends that should wait. Discuss with your sponsor which amends might cause more harm.', true),

  -- Step 9
  (9, 'Prioritize Your Amends', 'With your sponsor, prioritize your amends list. Which ones should be made first?', true),
  (9, 'Plan Specific Amends', 'For your first three amends, write out what you plan to say. Practice with your sponsor.', true),
  (9, 'Financial Amends Plan', 'If you owe money or have stolen, create a realistic plan to make financial amends.', true),
  (9, 'Record Your Progress', 'After each amend, write about the experience. How did it go? What did you learn?', true),

  -- Step 10
  (10, 'Establish Daily Inventory', 'Begin a daily practice of reviewing your day. Note where you were right and where you were wrong.', true),
  (10, 'Spot-Check Inventory', 'When you feel disturbed, immediately take a spot-check inventory. What''s really bothering you? What''s your part?', true),
  (10, 'Prompt Amends Practice', 'This week, make at least three prompt amends when you realize you''ve been wrong.', true),

  -- Step 11
  (11, 'Morning Meditation Practice', 'Establish a morning meditation practice. Spend at least 10 minutes in quiet reflection daily.', true),
  (11, 'Evening Review', 'Each evening, review your day and give thanks for the good. Ask for guidance for tomorrow.', true),
  (11, 'Study Spiritual Texts', 'Read spiritual literature daily for 15 minutes. Journal about insights you gain.', true),
  (11, 'Develop Personal Prayers', 'Write personal prayers that express your needs, gratitude, and desire for guidance.', true),

  -- Step 12
  (12, 'Share Your Story', 'Write your complete story including what it was like, what happened, and what it''s like now.', true),
  (12, 'Practice These Principles', 'Identify the 12 Step principles. Write about how you can practice them in all your affairs.', true),
  (12, 'Service Commitment', 'Take on a service commitment in your recovery community. Report weekly on your experience.', true),
  (12, 'Be Available', 'Make yourself available to help other alcoholics. Answer calls, attend meetings, offer support.', true);

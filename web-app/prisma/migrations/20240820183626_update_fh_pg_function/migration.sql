-- Create or Replace function calculate_user_forum_health()
CREATE OR REPLACE FUNCTION public.calculate_user_forum_health(
	)
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$

    BEGIN
        -- Main query to calculate user forum health scores ONLY
        WITH main_vars AS (
            SELECT
                CASE
                    WHEN EXTRACT(MINUTE FROM now()) < 30 THEN
                        date_trunc('hour', now() - INTERVAL '1 hour')
                    ELSE
                        date_trunc('hour', now() - INTERVAL '1 hour') + INTERVAL '30 minutes'
                END AS start_timestamp_var,
                to_char(now()::date, 'FMDay')::text AS day_of_week, -- using Fill Mode
                CASE
                    WHEN EXTRACT(MINUTE FROM now()) < 30 THEN
                        date_trunc('hour', now() - INTERVAL '1 hour') + INTERVAL '29 minutes 59 seconds'
                    ELSE
                        date_trunc('hour', now() - INTERVAL '1 hour') + INTERVAL '59 minutes 59 seconds'
                END AS end_timestamp_var
        )
        ,weeks_finished AS ( 
            SELECT
                forum_id,
                course_id,
            FLOOR((EXTRACT(EPOCH FROM (mv.start_timestamp_var::date + CAST(f.meeting_time AS TIME)) - (fc.starting_date + CAST(f.meeting_time AS TIME))) - EXTRACT(EPOCH FROM (meeting_time::time)::interval)) / 604800) AS weeks_since_start
            FROM
                forum_course fc
            JOIN
                "Forum" f ON fc.forum_id = f.id
            JOIN main_vars mv ON TRUE
            WHERE
                fc.is_current_course = TRUE
        )
        ,total_action_steps AS (
            SELECT
                f.id as forum_id,
                CASE
                    WHEN (fc.starting_date + CAST(f.meeting_time AS TIME)) > (mv.start_timestamp_var::date + CAST(f.meeting_time AS TIME) - INTERVAL '7 days')
                    THEN
                        (SELECT 
                            COUNT(*)
                            FROM generate_series(
                                (fc.starting_date + CAST(f.meeting_time AS TIME)),
                                (mv.start_timestamp_var::date + CAST(f.meeting_time AS TIME)), INTERVAL '1 day')
                            AS gen_date
                        WHERE EXTRACT(ISODOW FROM gen_date) < 6)
                    ELSE 5
                END AS ttl_act_stp
            FROM
                forum_course fc
            JOIN
                "Forum" f ON fc.forum_id = f.id
            JOIN main_vars mv ON TRUE
        )
        ,user_action_submissions AS (
            SELECT
                fc.forum_id,
                ufass.user_id,
                -- ufass.action_step_id,
                COUNT(ufass.id) AS user_action_submission_count,
                tas.ttl_act_stp
            FROM
                forum_course fc
            JOIN
                "Forum" f ON fc.forum_id = f.id
            JOIN weeks_finished wf ON fc.forum_id = wf.forum_id
            JOIN main_vars mv ON TRUE
            JOIN total_action_steps tas ON fc.forum_id = tas.forum_id
            JOIN 
                courses ON fc.course_id = courses.id 
                AND fc.is_current_course = TRUE
            JOIN 
                chapters ON courses.id = chapters.course_id
            JOIN user_forum uf ON uf.forum_id = fc.forum_id
            LEFT JOIN
                action_steps ON chapters.id = action_steps.chapter_id
            LEFT JOIN
                user_forum_action_step_status ufass 
                ON ufass.forum_id = fc.forum_id
                AND ufass.user_id = uf.user_id
                -- When pre/post-poning the meeting day, the system calculates the action_step based on past 5 days 
                -- instead of checking based on act_step ID
                -- AND action_steps.id = ufass.action_step_id
                AND ufass."createdAt" >= mv.start_timestamp_var - INTERVAL '1 week'
                AND ufass."createdAt" <= mv.end_timestamp_var
            WHERE 
                chapters.order = wf.weeks_since_start + 1 AND 
                fc.is_current_course = TRUE
            GROUP BY 
                fc.forum_id, ufass.user_id, tas.ttl_act_stp
            ORDER BY ufass.user_id ASC
        )
        , earliest_checkin AS (
            SELECT
                uf.user_id,
                f.id AS forum_id,
                MIN(ufms.checkin_time) AS earliest_checkin_time
            FROM "Forum" as f
            LEFT JOIN user_forum uf ON uf.forum_id = f.id
            LEFT JOIN forum_meetings fm ON fm.forum_id = f.id
            LEFT JOIN main_vars mv ON TRUE
            LEFT JOIN
                user_forum_meeting_status ufms ON ufms.forum_meeting_id = fm.id
                AND ufms.checkin_time >= mv.start_timestamp_var - INTERVAL '5 minutes' -- CRON running time previous hour's first 30 mins
                AND ufms.checkin_time <= mv.end_timestamp_var
                AND ufms.user_id = uf.user_id
                AND ufms.status = true
            GROUP BY
                uf.user_id, f.id
            ORDER BY f.id
        )
        ,user_meeting_score AS (
            SELECT
                uf.user_id,
                uf.forum_id,
                f.meeting_time,
                CASE
                    WHEN ec.earliest_checkin_time IS NULL THEN 0
                    WHEN ec.earliest_checkin_time <= (DATE_TRUNC('day', ec.earliest_checkin_time) + f.meeting_time::interval) THEN 3
                    WHEN ec.earliest_checkin_time <= (DATE_TRUNC('day', ec.earliest_checkin_time) + f.meeting_time::interval + INTERVAL '5 minutes') THEN 2
                    WHEN ec.earliest_checkin_time <= (DATE_TRUNC('day', ec.earliest_checkin_time) + f.meeting_time::interval + INTERVAL '10 minutes') THEN 1
                    ELSE 0
                END AS attendance_score,
                ec.earliest_checkin_time
            FROM
                user_forum uf
            JOIN
                "Forum" f ON uf.forum_id = f.id
            LEFT JOIN earliest_checkin ec ON uf.user_id = ec.user_id 
                AND uf.forum_id = ec.forum_id
            ORDER BY f.id
        )
        ,final_scores AS (
            SELECT
                mv.day_of_week,
                mv.start_timestamp_var AS mv_start_timestamp_var,
                COALESCE(COUNT(ufps.id),0) AS completed_prework,
                COUNT(lessons.id) AS total_prework,
                uas.ttl_act_stp,
                uf.user_id,
                fc.forum_id,
                chapters.id as curr_chpt_id,
                CASE 
                    WHEN COUNT(lessons.id) - COUNT(ufps.id) = 0 THEN 2 ELSE 0
                END AS fnl_prework_score,
                CASE 
                    WHEN uas.ttl_act_stp::int - COALESCE(uas.user_action_submission_count, 0) = 0 
                        THEN uas.ttl_act_stp 
                        ELSE COALESCE(uas.user_action_submission_count, 0)
                END AS fnl_actstp_score,
                COALESCE(ums.attendance_score, 0) AS fnl_attd_score,
                f.meeting_time,
                ums.earliest_checkin_time
            FROM
                "Forum" f
            JOIN
                forum_course fc ON fc.forum_id = f.id
            JOIN
                user_forum uf ON f.id = uf.forum_id
            JOIN
                courses ON fc.course_id = courses.id
            JOIN
                chapters ON courses.id = chapters.course_id
            JOIN weeks_finished wf ON fc.forum_id = wf.forum_id
            LEFT JOIN 
                lessons ON chapters.id = lessons.chapter_id
            JOIN main_vars mv ON TRUE
            LEFT JOIN
                user_forum_prework_status ufps ON ufps.user_id = uf.user_id 
                AND ufps.chapter_id = chapters.id
                AND ufps.forum_course_id = fc.id
                AND ufps.lesson_id = lessons.id
                AND ufps.status_percent >= 90
            JOIN
                user_action_submissions uas 
                ON fc.forum_id = uas.forum_id
                AND uf.user_id = uas.user_id
            LEFT JOIN
                user_meeting_score ums ON ums.forum_id = f.id
                AND ums.user_id = uf.user_id
                AND ums.earliest_checkin_time >= mv.start_timestamp_var - INTERVAL '5 minutes' -- CRON running time previous hour's first 30 mins
                AND ums.earliest_checkin_time <= mv.end_timestamp_var -- CRON running time previous hour's first 30 mins
            WHERE
                fc.is_current_course = TRUE
                AND f.is_active = TRUE
                AND f.meeting_day = mv.day_of_week
                AND f.meeting_time::time >= mv.start_timestamp_var::time -- Must be used in realtime query
                AND f.meeting_time::time <= mv.end_timestamp_var::time -- Must be used in realtime query
                AND chapters.order = wf.weeks_since_start + 1
            GROUP BY
                f.meeting_time
                , mv.start_timestamp_var, mv.day_of_week
                , uf.user_id
                , fc.forum_id
                , chapters.id
                -- , uas.action_step_id
                ,  uas.ttl_act_stp, uas.user_action_submission_count
                , ums.attendance_score, ums.earliest_checkin_time
            ORDER BY uf.user_id ASC
        )
        ,insert_into_user_forum_healths AS (
        -- -- INSERT into MCQ options of each user
            INSERT INTO user_forum_healths (health_mcq_option_id, user_id, forum_id, "date", score)
                SELECT (CONCAT('9992',fnl_prework_score)::int), user_id, forum_id, mv_start_timestamp_var, fnl_prework_score FROM final_scores
                    UNION ALL
                SELECT (CONCAT('9993',fnl_actstp_score)::int), user_id, forum_id, mv_start_timestamp_var, fnl_actstp_score FROM final_scores
                    UNION ALL
                SELECT (CONCAT('9991',fnl_attd_score)::int), user_id, forum_id, mv_start_timestamp_var, fnl_attd_score FROM final_scores
        )
        -- INSERT into user health score for every forum of each user
        INSERT INTO user_per_forum_health_score(
            user_id,
            forum_id,
            "date",
            score
        )
        SELECT 
            user_id, 
            forum_id, 
            mv_start_timestamp_var,
            (((fnl_prework_score::numeric(9,6) + fnl_actstp_score::numeric(9,6) + fnl_attd_score::numeric(9,6))::numeric(9,6) / (2 + COALESCE(ttl_act_stp, 0) + 3)::numeric(9,6)) * 10)::numeric(9,6) AS user_forum_health
        FROM final_scores;

        RETURN 'Successfully calculated the user forum health scores';
        
        EXCEPTION
            WHEN OTHERS THEN
                RETURN 'ERROR:' || SQLERRM;
                RAISE NOTICE 'An error occurred: %', SQLERRM;
    END;


$BODY$;
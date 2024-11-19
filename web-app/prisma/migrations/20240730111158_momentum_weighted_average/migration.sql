CREATE OR REPLACE VIEW forum_momentum AS
WITH monthly_averages AS (
    SELECT 
        user_id,
        forum_id,
        date_trunc('month', date) AS month,
        AVG(score) AS monthly_average_score
    FROM 
        user_per_forum_health_score
    WHERE
        date >= date_trunc('month', CURRENT_DATE) - INTERVAL '3 months'
    GROUP BY 
        user_id, forum_id, date_trunc('month', date)
),
missing_months AS (
    SELECT 
        DISTINCT user_id, 
        forum_id, 
		c.id AS company_id,
        generate_series(
            date_trunc('month', CURRENT_DATE) - INTERVAL '2 months', 
            date_trunc('month', CURRENT_DATE), 
            '1 month'
        ) AS month
    FROM 
        user_per_forum_health_score
	JOIN "User" u ON u.id = user_id
	JOIN "Company" c ON c.id = u.company_id
),
full_months AS (
    SELECT 
        mm.user_id,
        mm.forum_id,
		mm.company_id,
        mm.month,
        COALESCE(ma.monthly_average_score, 10) AS monthly_average_score
    FROM 
        missing_months mm
    LEFT JOIN 
        monthly_averages ma 
    ON 
        mm.user_id = ma.user_id 
        AND mm.forum_id = ma.forum_id 
        AND mm.month = ma.month
),
ranked_months AS (
    SELECT 
        user_id,
        forum_id,
		company_id,
        month,
        monthly_average_score,
        RANK() OVER (PARTITION BY user_id, forum_id ORDER BY month DESC) AS month_rank
    FROM 
        full_months
),
weighted_averages AS (
    SELECT 
        user_id,
        forum_id,
		company_id,
        CASE 
            WHEN month_rank = 1 THEN monthly_average_score * 0.5
            WHEN month_rank = 2 THEN monthly_average_score * 0.3
            WHEN month_rank = 3 THEN monthly_average_score * 0.2
            ELSE 0
        END AS weighted_score
    FROM 
        ranked_months
)
SELECT 
    user_id,
    forum_id,
	company_id,
    SUM(weighted_score) AS momentum
FROM 
    weighted_averages
GROUP BY 
    user_id, forum_id, company_id
ORDER BY user_id

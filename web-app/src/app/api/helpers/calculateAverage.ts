import prisma from "@/lib/prisma";

export class CalculateAverage {
  async userPerForum(userId: number, forumId: number) {
    try {
      const scores = await prisma.user_per_forum_health_score.findMany({
        where: {
          user_id: userId,
          forum_id: forumId,
          is_active: true,
        },
        select: {
          score: true,
        },
      });

      const totalScore = scores.reduce(
        (acc, curr) => Number(acc) + Number(curr.score),
        0
      );

      const averageScore = totalScore !== 0 ? totalScore / scores.length : 0;

      return Math.round(averageScore);
    } catch (err: any) {
      throw err;
    }
  }
  async forumHealth(forumId: number) {
    try {
      const scores = await prisma.user_per_forum_health_score.findMany({
        where: {
          forum_id: forumId,
          is_active: true,
        },
        select: {
          score: true,
        },
      });

      const totalScore = scores.reduce(
        (acc, curr) => Number(acc) + Number(curr.score),
        0
      );

      const averageScore = totalScore !== 0 ? totalScore / scores.length : 0;

      return Math.round(averageScore);
    } catch (err: any) {
      throw err;
    }
  }
  async userHealth(scores: any) {
    try {
      const totalScore = scores.reduce(
        (acc: any, curr: any) => Number(acc) + Number(curr.score),
        0
      );

      const averageScore = totalScore !== 0 ? totalScore / scores.length : 0;

      return Math.round(averageScore);
    } catch (err: any) {
      throw err;
    }
  }
  async calculateMomentumPercentage(scores: any) {
    try {
      const totalScore =
        scores.length === 0
          ? 0
          : scores.reduce((acc: any, { score }: any) => acc + Number(score), 0);

      const averageScore = totalScore === 0 ? 0 : totalScore / scores.length;

      // Convert the average score to a percentage
      return Math.round(averageScore * 10);
    } catch (err: any) {
      throw err;
    }
  }
}

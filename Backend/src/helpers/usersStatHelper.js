class UserStatsQueryBuilder {
  constructor(prisma) {
    this.prisma = prisma;
    this.thirtyDaysAgo = new Date();
    this.thirtyDaysAgo.setDate(this.thirtyDaysAgo.getDate() - 30);
  }

  buildBaseWhere({ role, type }) {
    let where = { is_super_user: false };

    if (role) {
      if (!isNaN(Number(role))) {
        where.role_id = Number(role);
      } else {
        where.role = { name: { equals: role, mode: "insensitive" } };
      }
    }

    if (type && (type === "internal" || type === "external")) {
      where.role = {
        ...where.role,
        type: type,
      };
    }

    return where;
  }

  async getBasicStats(where) {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      unverifiedUsers,
      // Users created in last 30 days
      totalUsersLast30Days,
      activeUsersLast30Days,
      suspendedUsersLast30Days,
      unverifiedUsersLast30Days,
      // Users created in previous 30 days (31-60 days ago)
      totalUsersPrev30Days,
      activeUsersPrev30Days,
      suspendedUsersPrev30Days,
      unverifiedUsersPrev30Days,
    ] = await Promise.all([
      // Current stats (all time totals)
      this.prisma.user.count({ where }),
      this.prisma.user.count({
        where: { ...where, is_verified: true, is_suspended: false },
      }),
      this.prisma.user.count({ where: { ...where, is_suspended: true } }),
      this.prisma.user.count({ where: { ...where, is_verified: false } }),
      // Last 30 days stats
      this.prisma.user.count({
        where: { ...where, createdAt: { gt: this.thirtyDaysAgo } },
      }),
      this.prisma.user.count({
        where: {
          ...where,
          createdAt: { gt: this.thirtyDaysAgo },
          is_verified: true,
          is_suspended: false,
        },
      }),
      this.prisma.user.count({
        where: {
          ...where,
          suspendedAt: { not: null, gt: this.thirtyDaysAgo },
        },
      }),
      this.prisma.user.count({
        where: {
          ...where,
          createdAt: { gt: this.thirtyDaysAgo },
          is_verified: false,
        },
      }),
      // Previous 30 days stats (31-60 days ago)
      this.prisma.user.count({
        where: {
          ...where,
          createdAt: {
            gt: sixtyDaysAgo,
            lte: this.thirtyDaysAgo,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          ...where,
          createdAt: {
            gt: sixtyDaysAgo,
            lte: this.thirtyDaysAgo,
          },
          is_verified: true,
          is_suspended: false,
        },
      }),
      this.prisma.user.count({
        where: {
          ...where,
          suspendedAt: { not: null, gt: sixtyDaysAgo, lte: this.thirtyDaysAgo },
        },
      }),
      this.prisma.user.count({
        where: {
          ...where,
          createdAt: {
            gt: sixtyDaysAgo,
            lte: this.thirtyDaysAgo,
          },
          is_verified: false,
        },
      }),
    ]);

    return {
      current: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        unverifiedUsers,
        totalUsersLast30Days,
        activeUsersLast30Days,
        suspendedUsersLast30Days,
        unverifiedUsersLast30Days,
      },
      historical: {
        totalUsers30DaysAgo: totalUsersPrev30Days,
        activeUsers30DaysAgo: activeUsersPrev30Days,
        suspendedUsers30DaysAgo: suspendedUsersPrev30Days,
        unverifiedUsers30DaysAgo: unverifiedUsersPrev30Days,
      },
    };
  }

  async getTypeBreakdownStats(type) {
    const typeWhere = { is_super_user: false, role: { type } };
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [
      total,
      active,
      suspended,
      unverified,
      // Last 30 days
      totalLast30Days,
      activeLast30Days,
      suspendedLast30Days,
      unverifiedLast30Days,
      // Previous 30 days (31-60 days ago)
      totalPrev30Days,
      activePrev30Days,
      suspendedPrev30Days,
      unverifiedPrev30Days,
    ] = await Promise.all([
      // Current stats (all time totals)
      this.prisma.user.count({ where: typeWhere }),
      this.prisma.user.count({
        where: { ...typeWhere, is_verified: true, is_suspended: false },
      }),
      this.prisma.user.count({ where: { ...typeWhere, is_suspended: true } }),
      this.prisma.user.count({ where: { ...typeWhere, is_verified: false } }),
      // Last 30 days stats
      this.prisma.user.count({
        where: { ...typeWhere, createdAt: { gt: this.thirtyDaysAgo } },
      }),
      this.prisma.user.count({
        where: {
          ...typeWhere,
          createdAt: { gt: this.thirtyDaysAgo },
          is_verified: true,
          is_suspended: false,
        },
      }),
      this.prisma.user.count({
        where: {
          ...typeWhere,
          createdAt: { gt: this.thirtyDaysAgo },
          is_suspended: true,
        },
      }),
      this.prisma.user.count({
        where: {
          ...typeWhere,
          createdAt: { gt: this.thirtyDaysAgo },
          is_verified: false,
        },
      }),
      // Previous 30 days stats (31-60 days ago)
      this.prisma.user.count({
        where: {
          ...typeWhere,
          createdAt: {
            gt: sixtyDaysAgo,
            lte: this.thirtyDaysAgo,
          },
        },
      }),
      this.prisma.user.count({
        where: {
          ...typeWhere,
          createdAt: {
            gt: sixtyDaysAgo,
            lte: this.thirtyDaysAgo,
          },
          is_verified: true,
          is_suspended: false,
        },
      }),
      this.prisma.user.count({
        where: {
          ...typeWhere,
          createdAt: {
            gt: sixtyDaysAgo,
            lte: this.thirtyDaysAgo,
          },
          is_suspended: true,
        },
      }),
      this.prisma.user.count({
        where: {
          ...typeWhere,
          createdAt: {
            gt: sixtyDaysAgo,
            lte: this.thirtyDaysAgo,
          },
          is_verified: false,
        },
      }),
    ]);

    return {
      current: {
        total,
        active,
        suspended,
        unverified,
        totalLast30Days,
        activeLast30Days,
        suspendedLast30Days,
        unverifiedLast30Days,
      },
      historical: {
        total30DaysAgo: totalPrev30Days,
        active30DaysAgo: activePrev30Days,
        suspended30DaysAgo: suspendedPrev30Days,
        unverified30DaysAgo: unverifiedPrev30Days,
      },
    };
  }

  async getAbsoluteTotalStats() {
    const where = { is_super_user: false };
    const [absoluteTotalUsers, absoluteTotalUsers30DaysAgo] = await Promise.all(
      [
        this.prisma.user.count({ where }),
        this.prisma.user.count({
          where: { ...where, createdAt: { lte: this.thirtyDaysAgo } },
        }),
      ]
    );

    return { absoluteTotalUsers, absoluteTotalUsers30DaysAgo };
  }

  calculatePercentageChange(current, previous) {
    if (typeof current !== "number" || typeof previous !== "number") return 0;
    if (previous === 0) return current === 0 ? 0 : 100;
    const change = ((current - previous) / Math.abs(previous)) * 100;
    return Number(change.toFixed(2));
  }

  formatStatsWithChanges(current, historical) {
    return {
      totalUsers: current.totalUsers,
      activeUsers: current.activeUsers,
      suspendedUsers: current.suspendedUsers,
      unverifiedUsers: current.unverifiedUsers,
      totalUsersChange: this.calculatePercentageChange(
        current.totalUsersLast30Days,
        historical.totalUsers30DaysAgo
      ),
      activeUsersChange: this.calculatePercentageChange(
        current.activeUsersLast30Days,
        historical.activeUsers30DaysAgo
      ),
      suspendedUsersChange: this.calculatePercentageChange(
        current.suspendedUsersLast30Days,
        historical.suspendedUsers30DaysAgo
      ),
      unverifiedUsersChange: this.calculatePercentageChange(
        current.unverifiedUsersLast30Days,
        historical.unverifiedUsers30DaysAgo
      ),
    };
  }

  formatTypeStats(current, historical, type) {
    return {
      total: current.total,
      active: current.active,
      suspended: current.suspended,
      unverified: current.unverified,
      totalChange: this.calculatePercentageChange(
        current.totalLast30Days,
        historical.total30DaysAgo
      ),
      activeChange: this.calculatePercentageChange(
        current.activeLast30Days,
        historical.active30DaysAgo
      ),
      suspendedChange: this.calculatePercentageChange(
        current.suspendedLast30Days,
        historical.suspended30DaysAgo
      ),
      unverifiedChange: this.calculatePercentageChange(
        current.unverifiedLast30Days,
        historical.unverified30DaysAgo
      ),
    };
  }
}

export { UserStatsQueryBuilder };

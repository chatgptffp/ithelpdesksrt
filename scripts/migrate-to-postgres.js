const { PrismaClient } = require('@prisma/client');

// SQLite connection (old)
const sqliteClient = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

// PostgreSQL connection (new)
const postgresClient = new PrismaClient();

async function migrateData() {
  try {
    console.log('🚀 Starting data migration from SQLite to PostgreSQL...');

    // 1. Migrate Roles
    console.log('📋 Migrating roles...');
    const roles = await sqliteClient.role.findMany();
    for (const role of roles) {
      await postgresClient.role.upsert({
        where: { code: role.code },
        update: role,
        create: role
      });
    }
    console.log(`✅ Migrated ${roles.length} roles`);

    // 2. Migrate OrgUnits
    console.log('🏢 Migrating organization units...');
    const orgUnits = await sqliteClient.orgUnit.findMany();
    for (const orgUnit of orgUnits) {
      await postgresClient.orgUnit.upsert({
        where: { id: orgUnit.id },
        update: orgUnit,
        create: orgUnit
      });
    }
    console.log(`✅ Migrated ${orgUnits.length} organization units`);

    // 3. Migrate Staff Users
    console.log('👥 Migrating staff users...');
    const staffUsers = await sqliteClient.staffUser.findMany();
    for (const user of staffUsers) {
      await postgresClient.staffUser.upsert({
        where: { email: user.email },
        update: user,
        create: user
      });
    }
    console.log(`✅ Migrated ${staffUsers.length} staff users`);

    // 4. Migrate Staff Role Maps
    console.log('🔗 Migrating staff role mappings...');
    const staffRoles = await sqliteClient.staffRoleMap.findMany();
    for (const staffRole of staffRoles) {
      await postgresClient.staffRoleMap.upsert({
        where: { 
          staffId_roleId: {
            staffId: staffRole.staffId,
            roleId: staffRole.roleId
          }
        },
        update: staffRole,
        create: staffRole
      });
    }
    console.log(`✅ Migrated ${staffRoles.length} staff role mappings`);

    // 5. Migrate Master Data
    console.log('📊 Migrating master data...');
    
    // Categories
    const categories = await sqliteClient.mdCategory.findMany();
    for (const category of categories) {
      await postgresClient.mdCategory.upsert({
        where: { code: category.code },
        update: category,
        create: category
      });
    }
    console.log(`✅ Migrated ${categories.length} categories`);

    // Priorities
    const priorities = await sqliteClient.mdPriority.findMany();
    for (const priority of priorities) {
      await postgresClient.mdPriority.upsert({
        where: { code: priority.code },
        update: priority,
        create: priority
      });
    }
    console.log(`✅ Migrated ${priorities.length} priorities`);

    // Systems
    const systems = await sqliteClient.mdSystem.findMany();
    for (const system of systems) {
      await postgresClient.mdSystem.upsert({
        where: { code: system.code },
        update: system,
        create: system
      });
    }
    console.log(`✅ Migrated ${systems.length} systems`);

    // Canned Responses
    const cannedResponses = await sqliteClient.mdCannedResponse.findMany();
    for (const response of cannedResponses) {
      await postgresClient.mdCannedResponse.upsert({
        where: { id: response.id },
        update: response,
        create: response
      });
    }
    console.log(`✅ Migrated ${cannedResponses.length} canned responses`);

    // 6. Migrate Support Teams
    console.log('👨‍💼 Migrating support teams...');
    const teams = await sqliteClient.supportTeam.findMany();
    for (const team of teams) {
      await postgresClient.supportTeam.upsert({
        where: { id: team.id },
        update: team,
        create: team
      });
    }
    console.log(`✅ Migrated ${teams.length} support teams`);

    // 7. Migrate Team Members
    console.log('👥 Migrating team members...');
    const teamMembers = await sqliteClient.teamMember.findMany();
    for (const member of teamMembers) {
      await postgresClient.teamMember.upsert({
        where: {
          teamId_staffId: {
            teamId: member.teamId,
            staffId: member.staffId
          }
        },
        update: member,
        create: member
      });
    }
    console.log(`✅ Migrated ${teamMembers.length} team members`);

    // 8. Migrate Assignment Rules
    console.log('📋 Migrating assignment rules...');
    const rules = await sqliteClient.assignmentRule.findMany();
    for (const rule of rules) {
      await postgresClient.assignmentRule.upsert({
        where: { id: rule.id },
        update: rule,
        create: rule
      });
    }
    console.log(`✅ Migrated ${rules.length} assignment rules`);

    // 9. Migrate Tickets
    console.log('🎫 Migrating tickets...');
    const tickets = await sqliteClient.ticket.findMany();
    for (const ticket of tickets) {
      await postgresClient.ticket.upsert({
        where: { id: ticket.id },
        update: ticket,
        create: ticket
      });
    }
    console.log(`✅ Migrated ${tickets.length} tickets`);

    // 10. Migrate Ticket Templates
    console.log('📝 Migrating ticket templates...');
    const templates = await sqliteClient.ticketTemplate.findMany();
    for (const template of templates) {
      await postgresClient.ticketTemplate.upsert({
        where: { id: template.id },
        update: template,
        create: template
      });
    }
    console.log(`✅ Migrated ${templates.length} ticket templates`);

    // 11. Migrate Knowledge Base
    console.log('📚 Migrating knowledge base...');
    
    // KB Categories
    const kbCategories = await sqliteClient.kbCategory.findMany();
    for (const category of kbCategories) {
      await postgresClient.kbCategory.upsert({
        where: { code: category.code },
        update: category,
        create: category
      });
    }
    console.log(`✅ Migrated ${kbCategories.length} KB categories`);

    // KB Articles
    const kbArticles = await sqliteClient.kbArticle.findMany();
    for (const article of kbArticles) {
      await postgresClient.kbArticle.upsert({
        where: { id: article.id },
        update: article,
        create: article
      });
    }
    console.log(`✅ Migrated ${kbArticles.length} KB articles`);

    // 12. Migrate other related data (comments, attachments, etc.)
    console.log('💬 Migrating comments...');
    const comments = await sqliteClient.comment.findMany();
    for (const comment of comments) {
      await postgresClient.comment.upsert({
        where: { id: comment.id },
        update: comment,
        create: comment
      });
    }
    console.log(`✅ Migrated ${comments.length} comments`);

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Run migration
migrateData()
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  });

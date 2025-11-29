import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, Task } from "../types";

export class TaskList extends OpenAPIRoute {
  schema = {
    tags: ["Tasks"],
    summary: "List Tasks",
    request: {
      query: z.object({
        page: Num({
          description: "Page number",
          default: 0,
        }),
        isCompleted: Bool({
          description: "Filter by completed",
          required: false,
        }),
      }),
    },
    responses: {
      "200": {
        description: "Returns a list of tasks",
        content: {
          "application/json": {
            schema: z.object({
              success: Bool(),
              result: z.object({
                tasks: Task.array(),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    // Extract validated query
    const data = await this.getValidatedData<typeof this.schema>();
    const { page, isCompleted } = data.query;

    const db = c.env.legal_db;

    // Build SQL
    let sql = `
      SELECT 
        name,
        slug,
        description,
        completed,
        due_date
      FROM documents
    `;

    const params: unknown[] = [];

    // Optional WHERE clause
    if (typeof isCompleted === "boolean") {
      sql += ` WHERE completed = ?`;
      params.push(isCompleted ? 1 : 0);
    }

    // Pagination
    sql += ` ORDER BY created_at DESC LIMIT 20 OFFSET ?`;
    params.push(page * 20);

    // Query
    const result = await db.prepare(sql).bind(...params).all();

    // Return API response
    return c.json({
      success: true,
      result: {
        tasks: result.results ?? [],
      },
    });
  }
}

import { DynamoDB } from "aws-sdk";
import { Redis } from "ioredis";

export default class {
  constructor(
    private readonly dynamoClient: DynamoDB,
    private readonly redisClient: Redis
  ) { }

  public getById = async () => ({ id: "test" });
  public getMany = async () => [{ id: "test" }];
  public create = async () => ({ id: "test" });
  public save = async () => ({ id: "test" });
}
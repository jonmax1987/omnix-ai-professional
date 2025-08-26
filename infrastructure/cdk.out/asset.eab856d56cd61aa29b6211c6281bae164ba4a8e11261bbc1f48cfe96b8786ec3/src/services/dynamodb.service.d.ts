export declare class DynamoDBService {
    private readonly client;
    private readonly docClient;
    private readonly tablePrefix;
    constructor();
    getTableName(tableName: string): string;
    scan(tableName: string, filter?: any): Promise<any[]>;
    get(tableName: string, key: Record<string, any>): Promise<any>;
    put(tableName: string, item: Record<string, any>): Promise<any>;
    update(tableName: string, key: Record<string, any>, updates: Record<string, any>): Promise<any>;
    delete(tableName: string, key: Record<string, any>): Promise<boolean>;
    query(tableName: string, indexName: string | null, keyCondition: string, expressionValues: Record<string, any>, expressionNames?: Record<string, string>): Promise<any[]>;
    batchWrite(tableName: string, putItems?: any[], deleteKeys?: any[]): Promise<void>;
}

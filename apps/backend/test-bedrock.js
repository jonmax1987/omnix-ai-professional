const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

async function testBedrock() {
  const client = new BedrockRuntimeClient({ 
    region: 'us-east-1'
  });

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 100,
    messages: [
      {
        role: 'user', 
        content: 'Hello! Please respond with exactly: BEDROCK_TEST_SUCCESS'
      }
    ]
  };

  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      body: JSON.stringify(payload),
      contentType: 'application/json'
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    console.log('✅ SUCCESS:', result.content[0].text);
    return true;
  } catch (error) {
    console.log('❌ ERROR:', error.message);
    return false;
  }
}

testBedrock();
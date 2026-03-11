export interface Env {
	MY_BUCKET: R2Bucket;
}

export default {
	async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
		// 1. 保存するファイル名を生成（例: 2024-03-11T00:00:00Z-test@example.com.eml）
		const timestamp = new Date().toISOString();
		const fileName = `${timestamp}-${message.from}.eml`;

		// 2. メールの生データ（raw）をR2に保存
		// message.raw は ReadableStream なのでそのまま put できます
		await env.MY_BUCKET.put(fileName, message.raw, {
			httpMetadata: {
				contentType: "message/rfc822", // メールの標準形式を指定
			}
		});

		console.log(`Saved email to R2: ${fileName}`);
	}
};

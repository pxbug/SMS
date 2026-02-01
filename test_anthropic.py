from anthropic import Anthropic
import sys

client = Anthropic(
    base_url="http://127.0.0.1:8045",
    api_key="sk-c07bc713be304fc1a2f0ad79a25efc8d"
)

# 保存对话历史
messages = []

print("--- Antigravity 交互对话模式 (输入 'exit' 或 'quit' 退出) ---")

while True:
    user_input = input("\n你: ")
    
    if user_input.lower() in ['exit', 'quit']:
        print("对话结束。")
        break
    
    if not user_input.strip():
        continue

    # 添加用户消息到历史
    messages.append({"role": "user", "content": user_input})

    try:
        # 使用流式输出以减少等待感
        with client.messages.stream(
            model="claude-opus-4-5-thinking",
            max_tokens=4096,
            messages=messages
        ) as stream:
            print("\n模型: ", end="", flush=True)
            assistant_text = ""
            for text in stream.text_stream:
                print(text, end="", flush=True)
                assistant_text += text
            print() # 换行

        # 将助理回复也加入历史
        messages.append({"role": "assistant", "content": assistant_text})
        
    except Exception as e:
        print(f"\n[错误]: {e}")

import openai
openai.api_key='OPENAI_KEY'

def ai_reply(msg):
 r=openai.ChatCompletion.create(
  model='gpt-4o-mini',
  messages=[{'role':'user','content':msg}]
 )
 return r.choices[0].message.content

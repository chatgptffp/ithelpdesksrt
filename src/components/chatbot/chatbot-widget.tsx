"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'สวัสดีครับ! ผมคือ IT Assistant ยินดีให้ความช่วยเหลือเรื่องการใช้งานระบบ IT ครับ 😊\n\nคุณสามารถถามเกี่ยวกับ:\n• วิธีแจ้งปัญหา\n• ตรวจสอบสถานะ Ticket\n• คำถามทั่วไปเกี่ยวกับระบบ\n• ปัญหาเทคนิคเบื้องต้น',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Simple keyword-based responses
    if (input.includes('แจ้งปัญหา') || input.includes('สร้าง') || input.includes('ticket')) {
      return `📝 **วิธีแจ้งปัญหา:**

1. คลิกปุ่ม "แจ้งปัญหาใหม่" หน้าแรก
2. กรอกข้อมูลส่วนตัว (รหัสพนักงาน, ชื่อ-สกุล)
3. เลือกหมวดหมู่และระบบที่มีปัญหา
4. อธิบายปัญหาให้ละเอียด
5. แนบไฟล์หลักฐาน (ถ้ามี)
6. กดส่งรายการ

💡 **เคล็ดลับ:** อธิบายปัญหาให้ชัดเจน จะช่วยให้ทีม IT แก้ไขได้เร็วขึ้น!`;
    }

    if (input.includes('ตรวจสอบ') || input.includes('สถานะ') || input.includes('track')) {
      return `🔍 **วิธีตรวจสอบสถานะ:**

1. ไปที่หน้า "ตรวจสอบสถานะ"
2. ใส่เลข Ticket (เช่น TK240001)
3. ใส่รหัสพนักงาน
4. กดค้นหา

📊 **สถานะต่างๆ:**
• **ใหม่** - รอทีม IT รับเรื่อง
• **กำลังดำเนินการ** - ทีม IT กำลังแก้ไข
• **รอข้อมูล** - รอข้อมูลเพิ่มเติมจากคุณ
• **แก้ไขแล้ว** - เสร็จสิ้นแล้ว รอการยืนยัน
• **ปิดงาน** - เสร็จสิ้นสมบูรณ์`;
    }

    if (input.includes('รหัสผ่าน') || input.includes('password') || input.includes('ลืม')) {
      return `🔐 **ปัญหารหัสผ่าน:**

**ลืมรหัสผ่าน:**
• ติดต่อทีม IT โดยตรง
• หรือแจ้งปัญหาผ่านระบบ (หมวดหมู่: Account)

**รหัสผ่านไม่ถูกต้อง:**
• ตรวจสอบ Caps Lock
• ลองพิมพ์ใน Notepad ก่อน
• ตรวจสอบภาษาไทย/อังกฤษ

⚠️ **ข้อควรระวัง:**
• ไม่แชร์รหัสผ่านกับผู้อื่น
• เปลี่ยนรหัสผ่านเป็นประจำ
• ใช้รหัสผ่านที่ปลอดภัย`;
    }

    if (input.includes('อินเทอร์เน็ต') || input.includes('internet') || input.includes('เน็ต')) {
      return `🌐 **ปัญหาอินเทอร์เน็ต:**

**ตรวจสอบเบื้องต้น:**
1. ลองเปิดเว็บไซต์อื่น
2. ตรวจสอบสาย LAN
3. Restart Router/Modem
4. ลอง Restart คอมพิวเตอร์

**หากยังไม่ได้:**
• แจ้งปัญหาผ่านระบบ (หมวดหมู่: Network)
• ระบุตำแหน่งที่นั่งและอาคาร
• บอกว่าเป็นปัญหาทั้งเครื่องหรือบางเว็บไซต์

📞 **ติดต่อด่วน:** หากเร่งด่วนโทร IT Helpdesk`;
    }

    if (input.includes('ช้า') || input.includes('slow') || input.includes('ค้าง')) {
      return `🐌 **คอมพิวเตอร์ช้า/ค้าง:**

**วิธีแก้เบื้องต้น:**
1. **Restart** คอมพิวเตอร์
2. ปิดโปรแกรมที่ไม่จำเป็น
3. ตรวจสอบ Task Manager (Ctrl+Shift+Esc)
4. ลบไฟล์ขยะใน Temp folder
5. ตรวจสอบ Disk Space

**หากยังช้า:**
• แจ้งปัญหา (หมวดหมู่: Hardware)
• ระบุอาการและเวลาที่เกิด
• บอกโปรแกรมที่ใช้งานตอนนั้น

💡 **เคล็ดลับ:** Restart เป็นประจำจะช่วยให้เครื่องทำงานดีขึ้น!`;
    }

    if (input.includes('ขอบคุณ') || input.includes('thank')) {
      return `😊 ยินดีครับ! หากมีคำถามอื่นๆ สามารถถามได้เสมอนะครับ

🔗 **ลิงก์ที่มีประโยชน์:**
• [แจ้งปัญหาใหม่](/report)
• [ตรวจสอบสถานะ](/track)
• [สถานีความรู้](/knowledge-base)

มีอะไรให้ช่วยอีกไหมครับ? 🤖`;
    }

    // Default response
    return `🤖 ขอโทษครับ ผมยังไม่เข้าใจคำถามนี้

**สิ่งที่ผมช่วยได้:**
• วิธีแจ้งปัญหา
• ตรวจสอบสถานะ Ticket  
• ปัญหารหัสผ่าน
• ปัญหาอินเทอร์เน็ต
• คอมพิวเตอร์ช้า/ค้าง

หรือลองถามใหม่ด้วยคำที่ง่ายๆ ครับ 😊`;
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-80 h-96 z-50 shadow-xl border-0 bg-white dark:bg-gray-800",
      isMinimized && "h-14"
    )}>
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <CardTitle className="text-sm font-medium">IT Assistant</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0 text-white hover:bg-blue-700"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0 text-white hover:bg-blue-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-80">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.type === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={cn(
                      "text-xs mt-1 opacity-70",
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    )}>
                      {message.timestamp.toLocaleTimeString('th-TH', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="พิมพ์คำถาม..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

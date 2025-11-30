import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageSquarePlus, 
  Search, 
  Shield, 
  BookOpen, 
  ArrowRight,
  Zap,
  Clock,
  CheckCircle2,
  Headphones,
  Monitor,
  Wifi
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">IT Helpdesk</span>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden xs:block">การรถไฟแห่งประเทศไทย</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/knowledge-base" className="hidden md:block">
              <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">
                <BookOpen className="h-4 w-4 mr-2" />
                สถานีความรู้
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 text-xs sm:text-sm">
                เข้าสู่ระบบ
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full text-sm font-medium text-green-700 dark:text-green-400 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                ระบบพร้อมให้บริการตลอด 24 ชั่วโมง
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
                ระบบแจ้งปัญหา
                <span className="text-blue-600"> IT Support</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 leading-relaxed">
                แจ้งปัญหาการใช้งานได้ทันที ติดตามสถานะแบบ Real-time
                <br className="hidden sm:block" />
                <span className="text-blue-600 font-medium">ไม่ต้องเข้าสู่ระบบ</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                <Link href="/report" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30">
                    <MessageSquarePlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    แจ้งปัญหาใหม่
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <Link href="/track" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 hover:text-blue-600">
                    <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    ติดตามสถานะ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-blue-600 py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center text-white">
              <div>
                <div className="text-xl sm:text-3xl md:text-4xl font-bold">24/7</div>
                <div className="text-blue-100 text-[10px] sm:text-sm mt-1">พร้อมให้บริการ</div>
              </div>
              <div>
                <div className="text-xl sm:text-3xl md:text-4xl font-bold">&lt;30<span className="hidden sm:inline"> นาที</span><span className="sm:hidden">m</span></div>
                <div className="text-blue-100 text-[10px] sm:text-sm mt-1">ตอบกลับเฉลี่ย</div>
              </div>
              <div>
                <div className="text-xl sm:text-3xl md:text-4xl font-bold">99%</div>
                <div className="text-blue-100 text-[10px] sm:text-sm mt-1">ความพึงพอใจ</div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                บริการของเรา
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                เลือกบริการที่คุณต้องการ
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Report Card */}
              <Card className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-5">
                    <MessageSquarePlus className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">แจ้งปัญหา</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 leading-relaxed">
                    แจ้งปัญหาการใช้งานระบบหรืออุปกรณ์ IT ได้ทันที พร้อมรับหมายเลข Ticket
                  </p>
                  <Link href="/report">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      แจ้งปัญหาใหม่
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Track Card */}
              <Card className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-5">
                    <Search className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">ติดตามงาน</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 leading-relaxed">
                    ตรวจสอบสถานะและความคืบหน้าของงานที่แจ้งไว้ได้ตลอดเวลา
                  </p>
                  <Link href="/track">
                    <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                      ติดตามสถานะ
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Knowledge Base Card */}
              <Card className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-5">
                    <BookOpen className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">สถานีความรู้</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 leading-relaxed">
                    บทความแนะนำวิธีแก้ปัญหาเบื้องต้นด้วยตัวเอง ประหยัดเวลา
                  </p>
                  <Link href="/knowledge-base">
                    <Button variant="outline" className="w-full border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                      อ่านบทความ
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                วิธีการใช้งาน
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                เพียง 3 ขั้นตอนง่ายๆ
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 relative">
                {/* Connection Line */}
                <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-0.5 bg-gray-200 dark:bg-gray-700" />

                {/* Step 1 */}
                <div className="relative text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg relative z-10">
                    <span className="text-xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">แจ้งปัญหา</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    กรอกข้อมูลและรายละเอียดปัญหาที่พบ
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg relative z-10">
                    <span className="text-xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">รับรหัส Ticket</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    บันทึกรหัส Ticket ไว้สำหรับติดตามสถานะ
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg relative z-10">
                    <span className="text-xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">ติดตามและประเมิน</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    ตรวจสอบความคืบหน้าและให้คะแนน
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                ทำไมต้องใช้ระบบนี้?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                ระบบที่ออกแบบมาเพื่อความสะดวกของคุณ
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">รวดเร็วทันใจ</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">แจ้งปัญหาได้ภายใน 1 นาที</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">ติดตามได้ 24 ชม.</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">เช็คสถานะได้ตลอดเวลา</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">ไม่ต้อง Login</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">ใช้งานง่าย ไม่ต้องสมัครสมาชิก</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Headphones className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">ทีมงานมืออาชีพ</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">พร้อมช่วยเหลือทุกปัญหา</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Monitor className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">รองรับทุกอุปกรณ์</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">ใช้งานได้ทุกที่ทุกเวลา</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wifi className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">อัปเดต Real-time</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">รับแจ้งเตือนทันทีที่มีความคืบหน้า</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:text-left gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">IT Helpdesk</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 IT Helpdesk - ฝ่ายเทคโนโลยีสารสนเทศ การรถไฟแห่งประเทศไทย
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/knowledge-base" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
                สถานีความรู้
              </Link>
              <Link href="/admin/login" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
                สำหรับเจ้าหน้าที่
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

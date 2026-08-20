import { useState } from "react";
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Plus, 
  Users, 
  PieChart, 
  MapPin, 
  Building2, 
  UserRound, 
  History, 
  Settings,
  Bed,
  UserCheck,
  Wallet,
  Ambulance,
  Heart,
  Brain,
  Scissors,
  User,
  Calendar,
  BarChart as BarChartIcon,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  List
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis,
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";

// Settings categories
const settingsCategories = [
  { name: 'General', icon: Settings },
  { name: 'Users & Permissions', icon: UserCheck },
  { name: 'Departments', icon: Building2 },
  { name: 'Notifications', icon: Bell },
  { name: 'Billing & Payments', icon: Wallet },
  { name: 'System', icon: Settings },
];

const SidebarLink = ({ icon: Icon, text, active, onClick }) => (
  <div 
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer ${active ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
    onClick={onClick}
  >
    <Icon size={20} className={active ? 'text-purple-700' : 'text-gray-500'} />
    <span className="ml-3 font-medium">{text}</span>
  </div>
);

const StatCard = ({ icon: Icon, number, text, iconColor, change }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <div className="flex justify-between mb-4">
      <div className={`p-3 rounded-full ${iconColor}`}>
        <Icon size={20} className="text-white" />
      </div>
      <button className="text-gray-400">•••</button>
    </div>
    <div className="text-2xl font-bold mb-1">{number}</div>
    <div className="flex justify-between items-center">
      <div className="text-gray-500 text-sm">{text}</div>
      {change && (
        <div className={`flex items-center text-sm ${change.type === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
          {change.type === 'increase' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span className="ml-1">{change.value}%</span>
        </div>
      )}
    </div>
  </div>
);

const DivisionRow = ({ division }) => {
  const Icon = division.icon;
  
  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-100">
      <div className="flex items-center">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Icon size={20} className="text-purple-500" />
        </div>
        <span className="ml-3 font-medium">{division.division}</span>
      </div>
      <span className="font-semibold">{division.patients}</span>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  let colorClass = "";
  
  switch(status) {
    case "Admitted":
      colorClass = "bg-green-100 text-green-800";
      break;
    case "Discharged":
      colorClass = "bg-blue-100 text-blue-800";
      break;
    case "Scheduled":
      colorClass = "bg-yellow-100 text-yellow-800";
      break;
    case "Available":
      colorClass = "bg-green-100 text-green-800";
      break;
    case "In Surgery":
      colorClass = "bg-red-100 text-red-800";
      break;
    case "With Patient":
      colorClass = "bg-yellow-100 text-yellow-800";
      break;
    case "On Leave":
      colorClass = "bg-gray-100 text-gray-800";
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800";
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
};

const TableHeader = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    {children}
  </th>
);

const PAGES = {
  DASHBOARD: 'dashboard',
  PATIENTS: 'patients',
  DOCTORS: 'doctors',
  DEPARTMENTS: 'departments',
  SETTINGS: 'settings',
  MAP: 'map',
  HISTORY: 'history'
};

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(PAGES.DASHBOARD);
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex space-x-1">
              <div className="h-6 w-2 bg-purple-700 rounded-sm"></div>
              <div className="h-6 w-2 bg-pink-500 rounded-sm"></div>
            </div>
            <span className="ml-2 font-bold text-gray-800">H-care</span>
          </div>
        </div>
        
        <div className="p-4">
          <button className="flex items-center justify-between w-full bg-orange-600 text-white px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <Plus size={20} />
              <span className="ml-2 font-medium">Register patient</span>
            </div>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <SidebarLink 
            icon={Users} 
            text="Patients" 
            active={currentPage === PAGES.PATIENTS} 
            onClick={() => setCurrentPage(PAGES.PATIENTS)}
          />
          <SidebarLink 
            icon={PieChart} 
            text="Overview" 
            active={currentPage === PAGES.DASHBOARD}
            onClick={() => setCurrentPage(PAGES.DASHBOARD)}
          />
          <SidebarLink 
            icon={MapPin} 
            text="Map" 
            active={currentPage === PAGES.MAP}
            onClick={() => setCurrentPage(PAGES.MAP)}
          />
          <SidebarLink 
            icon={Building2} 
            text="Departments" 
            active={currentPage === PAGES.DEPARTMENTS}
            onClick={() => setCurrentPage(PAGES.DEPARTMENTS)}
          />
          <SidebarLink 
            icon={UserRound} 
            text="Doctors" 
            active={currentPage === PAGES.DOCTORS}
            onClick={() => setCurrentPage(PAGES.DOCTORS)}
          />
          <SidebarLink 
            icon={History} 
            text="History" 
            active={currentPage === PAGES.HISTORY}
            onClick={() => setCurrentPage(PAGES.HISTORY)}
          />
          
          <div className="mt-8">
            <SidebarLink 
              icon={Settings} 
              text="Settings" 
              active={currentPage === PAGES.SETTINGS}
              onClick={() => setCurrentPage(PAGES.SETTINGS)}
            />
          </div>
        </div>
        
        <div className="p-4 mt-auto">
          <div className="bg-purple-50 p-4 rounded-xl text-center">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
                <span className="text-lg font-bold">0</span>
              </div>
            </div>
            <p className="text-gray-700 font-medium mb-2">Get mobile app</p>
            <div className="flex justify-center space-x-2">
              <button className="p-2 bg-white rounded-lg shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 22H22L12 2Z" fill="#34A853"/>
                  <path d="M12 2L22 12L2 12L12 2Z" fill="#EA4335"/>
                  <path d="M12 2L2 12V22L12 2Z" fill="#FBBC05"/>
                  <path d="M12 2L22 22V12L12 2Z" fill="#4285F4"/>
                </svg>
              </button>
              <button className="p-2 bg-white rounded-lg shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.8906 15.5C18.5371 16.3978 18.1085 17.1921 17.6055 17.9812C16.9086 19.0828 16.3066 19.8547 15.8008 20.3062C15.0254 21.0328 14.1934 21.4047 13.3027 21.4219C12.6504 21.4219 11.8574 21.2265 10.9277 20.8336C9.99707 20.4425 9.14355 20.25 8.36621 20.25C7.55371 20.25 6.67871 20.4425 5.74121 20.8336C4.80273 21.2265 4.04199 21.4312 3.45801 21.4499C2.60059 21.485 1.74414 21.1039 0.885742 20.3062C0.342773 19.8195 0.299805 19.0292 -0.243164 17.9359C-0.9375 16.5562 -1.28906 15.2273 -1.28906 13.9491C-1.28906 12.4715 -0.852539 11.2019 -0.00195312 10.1421C0.666992 9.31836 1.5293 8.6687 2.58691 8.19058C3.64355 7.71245 4.76953 7.46655 5.96484 7.44995C6.6543 7.44995 7.55371 7.67769 8.66699 8.12847C9.7793 8.5801 10.4863 8.80882 10.7871 8.80882C11.0137 8.80882 11.8164 8.54453 13.0898 8.01753C14.2969 7.52675 15.293 7.31933 16.0801 7.39058C18.3691 7.55882 20.1035 8.41557 21.2812 9.96284C19.209 11.2632 18.1816 13.0292 18.1992 15.2563C18.2158 17.0175 18.8145 18.5136 19.9922 19.7409C19.5195 20.0644 19.0195 20.3425 18.5 20.5761C17.9648 20.8167 17.4531 20.9991 16.9629 21.1273" fill="black"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-full sm:w-64 md:w-80">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none text-sm ml-2 focus:outline-none w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-end">
              <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 relative">
                <Bell size={20} />
                <div className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></div>
              </button>

              <div className="flex items-center ml-4">
                <div className="h-8 w-8 bg-purple-200 rounded-full overflow-hidden">
                  <img src="/api/placeholder/32/32" alt="User" className="h-full w-full object-cover" />
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:inline">Emma Kwan</span>
                <ChevronDown size={16} className="ml-1 text-gray-400" />
              </div>
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">
          
        </main>
      </div>
    </div>
  );
}
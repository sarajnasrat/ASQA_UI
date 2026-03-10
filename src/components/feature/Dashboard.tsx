import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Tag } from 'primereact/tag';
import { Skeleton } from 'primereact/skeleton';

import { RoleService } from '../../services/role.service';
import { PermissionService } from '../../services/permission.service';
import { MenuService } from '../../services/menu.service';
import UserService from '../../services/user.service.ts';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalRoles: number;
  totalPermissions: number;
  totalMenus: number;
  activeMenus: number;
  recentActivities: Activity[];
  userGrowth: number[];
  roleDistribution: { [key: string]: number };
}

interface Activity {
  id: string;
  type: 'user' | 'role' | 'permission' | 'menu';
  action: string;
  target: string;
  timestamp: string;
  user: string;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [usersRes, rolesRes, permissionsRes, menusRes] = await Promise.all([
        UserService.getAllUsers(),
        RoleService.getAllRoles(),
        PermissionService.getAllPermissions(),
        MenuService.getAllMenus(),
      ]);

      const users = usersRes.data || [];
      const roles = rolesRes.data || [];
      const permissions = permissionsRes.data || [];
      const menus = menusRes.data || [];

      // Calculate statistics
      const activeUsers = users.filter((u: any) => u.active !== false).length;
      const activeMenus = menus.filter((m: any) => m.active !== false).length;

      // Mock recent activities (replace with actual API call)
      const recentActivities: Activity[] = [
        {
          id: '1',
          type: 'user',
          action: 'created',
          target: 'John Doe',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: 'Admin'
        },
        {
          id: '2',
          type: 'role',
          action: 'updated',
          target: 'Manager Role',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user: 'Admin'
        },
        {
          id: '3',
          type: 'permission',
          action: 'assigned',
          target: 'Edit Users',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          user: 'System'
        },
        {
          id: '4',
          type: 'menu',
          action: 'created',
          target: 'Dashboard',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          user: 'Admin'
        },
        {
          id: '5',
          type: 'user',
          action: 'deactivated',
          target: 'Jane Smith',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          user: 'Admin'
        }
      ];

      // Mock user growth data
      const userGrowth = [65, 72, 80, 85, 92, 98, 105, 112, 118, 125, 132, 140];

      // Mock role distribution
      const roleDistribution = {
        'Admin': 3,
        'Manager': 8,
        'Editor': 15,
        'Viewer': 24,
        'Guest': 12
      };

      setStats({
        totalUsers: users.length,
        activeUsers,
        inactiveUsers: users.length - activeUsers,
        totalRoles: roles.length,
        totalPermissions: permissions.length,
        totalMenus: menus.length,
        activeMenus,
        recentActivities,
        userGrowth,
        roleDistribution
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'User Growth',
        data: stats?.userGrowth || [],
        fill: false,
        borderColor: '#4f46e5',
        tension: 0.4,
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
      }
    ]
  };

  const lineChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const pieChartData = {
    labels: Object.keys(stats?.roleDistribution || {}),
    datasets: [
      {
        data: Object.values(stats?.roleDistribution || {}),
        backgroundColor: ['#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
        borderWidth: 0
      }
    ]
  };

  const pieChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8
        }
      }
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return 'pi pi-user';
      case 'role': return 'pi pi-shield';
      case 'permission': return 'pi pi-lock';
      case 'menu': return 'pi pi-bars';
      default: return 'pi pi-info-circle';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-600';
      case 'role': return 'bg-purple-100 text-purple-600';
      case 'permission': return 'bg-green-100 text-green-600';
      case 'menu': return 'bg-amber-100 text-amber-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back! Here's what's happening with your application.
            </p>
          </div>
          
        
        </div>

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          {/* Users Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-l-4 border-blue-500 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Users</p>
                {loading ? (
                  <Skeleton width="80px" height="32px" />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-800">{stats?.totalUsers}</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      +{stats?.activeUsers} active
                    </span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="pi pi-users text-blue-600 text-xl"></i>
              </div>
            </div>
    
          </Card>

          {/* Roles Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-l-4 border-purple-500 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Roles</p>
                {loading ? (
                  <Skeleton width="80px" height="32px" />
                ) : (
                  <span className="text-2xl font-bold text-gray-800">{stats?.totalRoles}</span>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="pi pi-shield text-purple-600 text-xl"></i>
              </div>
            </div>
     
          </Card>

          {/* Permissions Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-l-4 border-green-500 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Permissions</p>
                {loading ? (
                  <Skeleton width="80px" height="32px" />
                ) : (
                  <span className="text-2xl font-bold text-gray-800">{stats?.totalPermissions}</span>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="pi pi-lock text-green-600 text-xl"></i>
              </div>
            </div>
        
          </Card>

          {/* Menus Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-200 border-l-4 border-amber-500 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Menus</p>
                {loading ? (
                  <Skeleton width="80px" height="32px" />
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-800">{stats?.totalMenus}</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      {stats?.activeMenus} active
                    </span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <i className="pi pi-bars text-amber-600 text-xl"></i>
              </div>
            </div>
     
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-2">
          {/* User Growth Chart */}
          <Card className="lg:col-span-2 shadow-lg rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">User Growth</h3>
              <Tag value="+25% vs last year" severity="success" className="text-xs" />
            </div>
            <div style={{ height: '250px' }}>
              {loading ? (
                <Skeleton height="250px" />
              ) : (
                <Chart type="line" data={lineChartData} options={lineChartOptions} />
              )}
            </div>
          </Card>

          {/* Role Distribution */}
          <Card className="shadow-lg rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Role Distribution</h3>
            <div style={{ height: '250px' }}>
              {loading ? (
                <Skeleton height="250px" />
              ) : (
                <Chart type="pie" data={pieChartData} options={pieChartOptions} />
              )}
            </div>
          </Card>
        </div>

    
      </div>
    </div>
  );
};

export default Dashboard;
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { baseShouldForwardProp } from '../../utils/styledUtils';
import { 
  Users, 
  Share2, 
  Plus, 
  Check, 
  X, 
  Trash2, 
  Edit3, 
  UserPlus, 
  Crown, 
  Clock, 
  ShoppingCart,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Send,
  MessageCircle,
  Gift,
  Star,
  Heart,
  Target,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Settings,
  Copy,
  Link,
  QrCode,
  Mail,
  Phone,
  Download,
  Upload,
  Smartphone,
  Wifi,
  WifiOff,
  Sync,
  Zap,
  Activity
} from 'lucide-react';

const Container = styled(motion.div)`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconWrapper = styled.div`
  width: 32px;
  height: 32px;
  background: ${({ theme }) => theme.colors.primary.light};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary.main : 
    variant === 'secondary' ? theme.colors.secondary.main : 
    variant === 'success' ? theme.colors.success.main :
    theme.colors.gray[100]};
  color: ${({ variant, theme }) => 
    variant === 'primary' || variant === 'secondary' || variant === 'success' ? 'white' : theme.colors.text.primary};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const StatusBar = styled.div.withConfig({
  shouldForwardProp: (prop) => !['online'].includes(prop)
})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: ${({ online, theme }) => online ? theme.colors.success.light : theme.colors.warning.light};
  color: ${({ online, theme }) => online ? theme.colors.success.main : theme.colors.warning.main};
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LastSync = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const TabNavigation = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  overflow-x: auto;
`;

const TabButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop)
})`
  flex: 1;
  min-width: 120px;
  padding: 12px 16px;
  background: ${({ active, theme }) => active ? theme.colors.primary.main : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.secondary};
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary.main : theme.colors.gray[100]};
  }
`;

const FamilyMembersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const MemberCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop)
})`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
  border: 2px solid ${({ active, theme }) => active ? theme.colors.primary.main : 'transparent'};
`;

const MemberHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const MemberAvatar = styled.div.withConfig({
  shouldForwardProp: (prop) => !['color'].includes(prop)
})`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ color, theme }) => color || theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  position: relative;
`;

const MemberStatus = styled.div.withConfig({
  shouldForwardProp: (prop) => !['online'].includes(prop)
})`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ online, theme }) => online ? theme.colors.success.main : theme.colors.gray[400]};
  border: 2px solid white;
`;

const MemberInfo = styled.div`
  flex: 1;
`;

const MemberName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MemberRole = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  font-weight: 500;
`;

const MemberActions = styled.div`
  display: flex;
  gap: 8px;
`;

const MemberActionButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop)
})`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary.light : 
    variant === 'warning' ? theme.colors.warning.light : 
    variant === 'error' ? theme.colors.error.light : 
    theme.colors.gray[100]};
  color: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.primary.main : 
    variant === 'warning' ? theme.colors.warning.main : 
    variant === 'error' ? theme.colors.error.main : 
    theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const MemberStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 8px;
  background: white;
  border-radius: 6px;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  font-weight: 500;
`;

const SharedListsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SharedListCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const SharedListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SharedListTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ListMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SharedListContent = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: start;
`;

const ItemsPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ItemPreview = styled.div.withConfig({
  shouldForwardProp: (prop) => !['completed'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ completed, theme }) => completed ? theme.colors.text.secondary : theme.colors.text.primary};
  text-decoration: ${({ completed }) => completed ? 'line-through' : 'none'};
`;

const ItemCheckbox = styled.div.withConfig({
  shouldForwardProp: (prop) => !['checked'].includes(prop)
})`
  width: 16px;
  height: 16px;
  border: 2px solid ${({ checked, theme }) => checked ? theme.colors.success.main : theme.colors.gray[300]};
  border-radius: 3px;
  background: ${({ checked, theme }) => checked ? theme.colors.success.main : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
`;

const ContributorsAvatars = styled.div`
  display: flex;
  gap: -8px;
  margin-left: auto;
`;

const ContributorAvatar = styled.div.withConfig({
  shouldForwardProp: (prop) => !['color'].includes(prop)
})`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ color, theme }) => color || theme.colors.primary.main};
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
  margin-left: -8px;
`;

const InvitationPanel = styled.div`
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const InvitationMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const InvitationMethod = styled(motion.div)`
  background: white;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.colors.gray[200]};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
    transform: translateY(-2px);
  }
`;

const MethodIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.primary.light};
  color: ${({ theme }) => theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
`;

const MethodTitle = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const MethodDescription = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`;

const ActivityFeed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityItem = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['type'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: 8px;
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ type, theme }) => 
    type === 'add' ? theme.colors.success.light : 
    type === 'complete' ? theme.colors.primary.light : 
    type === 'remove' ? theme.colors.error.light : 
    theme.colors.gray[200]};
  color: ${({ type, theme }) => 
    type === 'add' ? theme.colors.success.main : 
    type === 'complete' ? theme.colors.primary.main : 
    type === 'remove' ? theme.colors.error.main : 
    theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityDescription = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 2px;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const NotificationSettings = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[100]};

  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const SettingDescription = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 2px;
`;

const Toggle = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop)
})
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: ${({ active, theme }) => active ? theme.colors.primary.main : theme.colors.gray[300]};
  border: none;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ active }) => active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s ease;
  }
`;

const ShoppingListSharing = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState('2 mins ago');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [sharedLists, setSharedLists] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState({
    newItems: true,
    completedItems: true,
    listShared: true,
    memberJoined: false,
    dailyReminder: true
  });

  // Mock data
  const mockMembers = [
    {
      id: 1,
      name: 'Sarah (You)',
      role: 'Admin',
      email: 'sarah@family.com',
      avatar: 'S',
      color: '#6366F1',
      online: true,
      stats: { listsCreated: 12, itemsAdded: 156, completionRate: 89 },
      lastActive: 'now'
    },
    {
      id: 2,
      name: 'Mike',
      role: 'Member',
      email: 'mike@family.com',
      avatar: 'M',
      color: '#10B981',
      online: true,
      stats: { listsCreated: 3, itemsAdded: 89, completionRate: 76 },
      lastActive: '5 mins ago'
    },
    {
      id: 3,
      name: 'Emma',
      role: 'Member',
      email: 'emma@family.com',
      avatar: 'E',
      color: '#F59E0B',
      online: false,
      stats: { listsCreated: 5, itemsAdded: 67, completionRate: 92 },
      lastActive: '2 hours ago'
    },
    {
      id: 4,
      name: 'Alex',
      role: 'Member',
      email: 'alex@family.com',
      avatar: 'A',
      color: '#EF4444',
      online: true,
      stats: { listsCreated: 1, itemsAdded: 23, completionRate: 45 },
      lastActive: '10 mins ago'
    }
  ];

  const mockSharedLists = [
    {
      id: 1,
      title: 'Weekly Groceries',
      creator: 'Sarah',
      contributors: ['S', 'M', 'E'],
      itemCount: 24,
      completedCount: 18,
      lastUpdated: '5 mins ago',
      dueDate: 'Today',
      items: [
        { name: 'Milk', completed: true },
        { name: 'Bread', completed: true },
        { name: 'Apples', completed: false },
        { name: 'Chicken Breast', completed: false },
        { name: 'Rice', completed: true }
      ]
    },
    {
      id: 2,
      title: 'Birthday Party Prep',
      creator: 'Mike',
      contributors: ['M', 'S'],
      itemCount: 15,
      completedCount: 8,
      lastUpdated: '1 hour ago',
      dueDate: 'Tomorrow',
      items: [
        { name: 'Birthday Cake', completed: false },
        { name: 'Balloons', completed: true },
        { name: 'Candles', completed: true },
        { name: 'Ice Cream', completed: false }
      ]
    },
    {
      id: 3,
      title: 'Emergency Kit',
      creator: 'Emma',
      contributors: ['E', 'S', 'A'],
      itemCount: 12,
      completedCount: 12,
      lastUpdated: '3 days ago',
      dueDate: 'No due date',
      items: [
        { name: 'First Aid Kit', completed: true },
        { name: 'Flashlight', completed: true },
        { name: 'Batteries', completed: true },
        { name: 'Water Bottles', completed: true }
      ]
    }
  ];

  const mockActivities = [
    {
      id: 1,
      type: 'add',
      user: 'Mike',
      action: 'added "Birthday Cake" to Birthday Party Prep',
      time: '5 mins ago'
    },
    {
      id: 2,
      type: 'complete',
      user: 'Sarah',
      action: 'completed "Milk" in Weekly Groceries',
      time: '8 mins ago'
    },
    {
      id: 3,
      type: 'add',
      user: 'Emma',
      action: 'added 3 items to Weekly Groceries',
      time: '15 mins ago'
    },
    {
      id: 4,
      type: 'complete',
      user: 'Alex',
      action: 'completed "Bread" in Weekly Groceries',
      time: '20 mins ago'
    },
    {
      id: 5,
      type: 'remove',
      user: 'Sarah',
      action: 'removed "Expired Yogurt" from Weekly Groceries',
      time: '1 hour ago'
    }
  ];

  useEffect(() => {
    setFamilyMembers(mockMembers);
    setSharedLists(mockSharedLists);
    setActivities(mockActivities);
  }, []);

  const toggleItemComplete = (listId, itemIndex) => {
    setSharedLists(prev => prev.map(list => {
      if (list.id === listId) {
        const newItems = [...list.items];
        newItems[itemIndex].completed = !newItems[itemIndex].completed;
        const completedCount = newItems.filter(item => item.completed).length;
        return { ...list, items: newItems, completedCount };
      }
      return list;
    }));
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const invitationMethods = [
    {
      icon: Mail,
      title: 'Email Invitation',
      description: 'Send invitation link via email'
    },
    {
      icon: Phone,
      title: 'SMS Invitation',
      description: 'Send invitation link via text message'
    },
    {
      icon: QrCode,
      title: 'QR Code',
      description: 'Generate QR code for quick scanning'
    },
    {
      icon: Link,
      title: 'Share Link',
      description: 'Copy shareable invitation link'
    }
  ];

  const tabs = [
    { id: 'members', label: 'Family Members', icon: Users },
    { id: 'lists', label: 'Shared Lists', icon: ShoppingCart },
    { id: 'activity', label: 'Activity Feed', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderMembers = () => (
    <div>
      <InvitationPanel>
        <Title>
          <UserPlus size={20} />
          Invite Family Members
        </Title>
        <InvitationMethods>
          {invitationMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <InvitationMethod
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MethodIcon>
                  <Icon size={20} />
                </MethodIcon>
                <MethodTitle>{method.title}</MethodTitle>
                <MethodDescription>{method.description}</MethodDescription>
              </InvitationMethod>
            );
          })}
        </InvitationMethods>
      </InvitationPanel>

      <FamilyMembersGrid>
        {familyMembers.map(member => (
          <MemberCard
            key={member.id}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <MemberHeader>
              <MemberAvatar color={member.color}>
                {member.avatar}
                <MemberStatus online={member.online} />
              </MemberAvatar>
              
              <MemberInfo>
                <MemberName>
                  {member.name}
                  {member.role === 'Admin' && <Crown size={14} />}
                </MemberName>
                <MemberRole>{member.role}</MemberRole>
              </MemberInfo>
              
              <MemberActions>
                <MemberActionButton variant="primary">
                  <MessageCircle size={14} />
                </MemberActionButton>
                {member.role !== 'Admin' && (
                  <MemberActionButton variant="error">
                    <Trash2 size={14} />
                  </MemberActionButton>
                )}
              </MemberActions>
            </MemberHeader>
            
            <MemberStats>
              <StatCard>
                <StatValue>{member.stats.listsCreated}</StatValue>
                <StatLabel>Lists</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{member.stats.itemsAdded}</StatValue>
                <StatLabel>Items</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{member.stats.completionRate}%</StatValue>
                <StatLabel>Complete</StatLabel>
              </StatCard>
            </MemberStats>
          </MemberCard>
        ))}
      </FamilyMembersGrid>
    </div>
  );

  const renderSharedLists = () => (
    <SharedListsContainer>
      {sharedLists.map(list => (
        <SharedListCard
          key={list.id}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <SharedListHeader>
            <SharedListTitle>
              <ShoppingCart size={18} />
              {list.title}
            </SharedListTitle>
            
            <ListMeta>
              <span>{list.completedCount}/{list.itemCount} completed</span>
              <span>•</span>
              <span>Updated {list.lastUpdated}</span>
              <span>•</span>
              <span>Due {list.dueDate}</span>
            </ListMeta>
          </SharedListHeader>
          
          <SharedListContent>
            <ItemsPreview>
              {list.items.slice(0, 4).map((item, index) => (
                <ItemPreview key={index} completed={item.completed}>
                  <ItemCheckbox
                    checked={item.completed}
                    onClick={() => toggleItemComplete(list.id, index)}
                  >
                    {item.completed && <Check size={10} />}
                  </ItemCheckbox>
                  {item.name}
                </ItemPreview>
              ))}
              {list.items.length > 4 && (
                <ItemPreview style={{ color: '#9CA3AF' }}>
                  +{list.items.length - 4} more items...
                </ItemPreview>
              )}
            </ItemsPreview>
            
            <ContributorsAvatars>
              {list.contributors.map((contributor, index) => (
                <ContributorAvatar
                  key={index}
                  color={familyMembers.find(m => m.avatar === contributor)?.color}
                >
                  {contributor}
                </ContributorAvatar>
              ))}
            </ContributorsAvatars>
          </SharedListContent>
        </SharedListCard>
      ))}
    </SharedListsContainer>
  );

  const renderActivity = () => (
    <ActivityFeed>
      {activities.map(activity => (
        <ActivityItem
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ActivityIcon type={activity.type}>
            {activity.type === 'add' && <Plus size={14} />}
            {activity.type === 'complete' && <Check size={14} />}
            {activity.type === 'remove' && <X size={14} />}
          </ActivityIcon>
          
          <ActivityContent>
            <ActivityDescription>
              <strong>{activity.user}</strong> {activity.action}
            </ActivityDescription>
            <ActivityTime>{activity.time}</ActivityTime>
          </ActivityContent>
        </ActivityItem>
      ))}
    </ActivityFeed>
  );

  const renderSettings = () => (
    <NotificationSettings>
      <Title>
        <Bell size={20} />
        Notification Settings
      </Title>
      
      <div style={{ marginTop: '20px' }}>
        <SettingItem>
          <div>
            <SettingLabel>New Items Added</SettingLabel>
            <SettingDescription>Get notified when family members add items to shared lists</SettingDescription>
          </div>
          <Toggle
            active={notifications.newItems}
            onClick={() => toggleNotification('newItems')}
            whileTap={{ scale: 0.95 }}
          />
        </SettingItem>
        
        <SettingItem>
          <div>
            <SettingLabel>Items Completed</SettingLabel>
            <SettingDescription>Get notified when items are marked as completed</SettingDescription>
          </div>
          <Toggle
            active={notifications.completedItems}
            onClick={() => toggleNotification('completedItems')}
            whileTap={{ scale: 0.95 }}
          />
        </SettingItem>
        
        <SettingItem>
          <div>
            <SettingLabel>List Shared</SettingLabel>
            <SettingDescription>Get notified when new lists are shared with you</SettingDescription>
          </div>
          <Toggle
            active={notifications.listShared}
            onClick={() => toggleNotification('listShared')}
            whileTap={{ scale: 0.95 }}
          />
        </SettingItem>
        
        <SettingItem>
          <div>
            <SettingLabel>Member Joined</SettingLabel>
            <SettingDescription>Get notified when new family members join</SettingDescription>
          </div>
          <Toggle
            active={notifications.memberJoined}
            onClick={() => toggleNotification('memberJoined')}
            whileTap={{ scale: 0.95 }}
          />
        </SettingItem>
        
        <SettingItem>
          <div>
            <SettingLabel>Daily Reminder</SettingLabel>
            <SettingDescription>Get daily reminders about pending shopping lists</SettingDescription>
          </div>
          <Toggle
            active={notifications.dailyReminder}
            onClick={() => toggleNotification('dailyReminder')}
            whileTap={{ scale: 0.95 }}
          />
        </SettingItem>
      </div>
    </NotificationSettings>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'members':
        return renderMembers();
      case 'lists':
        return renderSharedLists();
      case 'activity':
        return renderActivity();
      case 'settings':
        return renderSettings();
      default:
        return renderMembers();
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Header>
        <Title>
          <IconWrapper>
            <Users size={18} />
          </IconWrapper>
          Family Shopping Lists
        </Title>
        
        <ActionButtons>
          <ActionButton variant="secondary">
            <Share2 size={14} />
            Share Family
          </ActionButton>
          <ActionButton variant="success">
            <Sync size={14} />
            Sync Now
          </ActionButton>
        </ActionButtons>
      </Header>

      <StatusBar online={isOnline}>
        <StatusInfo>
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isOnline ? 'Connected' : 'Offline Mode'}
        </StatusInfo>
        <LastSync>Last sync: {lastSync}</LastSync>
      </StatusBar>

      <Content>
        <TabNavigation>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={16} />
                {tab.label}
              </TabButton>
            );
          })}
        </TabNavigation>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </Content>
    </Container>
  );
};

export default ShoppingListSharing;
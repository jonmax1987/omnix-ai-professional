import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { baseShouldForwardProp } from '../../utils/styledUtils';
import { 
  Award, 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  Target, 
  Zap, 
  Fire, 
  Heart, 
  Gift, 
  Shield, 
  Gem, 
  Sparkles, 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  PiggyBank, 
  Percent, 
  Clock, 
  Calendar, 
  Users, 
  Share2, 
  Download, 
  Lock, 
  Unlock, 
  ChevronRight, 
  Plus, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Filter, 
  Search, 
  MoreHorizontal,
  RefreshCw,
  Settings,
  Bell,
  Lightbulb,
  Rocket,
  Mountain,
  Flag,
  BookOpen,
  Coffee,
  Leaf,
  Globe,
  Camera,
  Music,
  Palette
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
    theme.colors.gray[100]};
  color: ${({ variant, theme }) => 
    variant === 'primary' || variant === 'secondary' ? 'white' : theme.colors.text.primary};
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

const UserStats = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
`;

const UserStatsBackground = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(50px, -50px);
`;

const UserLevel = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
`;

const LevelBadge = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8B4513;
  font-size: 24px;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
`;

const LevelInfo = styled.div`
  flex: 1;
`;

const LevelTitle = styled.h4`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const LevelDescription = styled.p`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 12px;
`;

const ProgressContainer = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 3px;
  position: relative;
  z-index: 1;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: linear-gradient(90deg, #FFD700, #FFA500);
  border-radius: 8px;
  width: ${({ progress }) => progress}%;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.9;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 20px;
  position: relative;
  z-index: 1;
`;

const StatCard = styled.div`
  text-align: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.8;
  text-transform: uppercase;
  font-weight: 500;
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

const BadgesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const BadgeCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['earned', 'rarity'].includes(prop)
})`
  background: ${({ earned, theme }) => earned ? 'white' : theme.colors.gray[50]};
  border-radius: 16px;
  padding: 20px;
  box-shadow: ${({ earned }) => earned ? '0 4px 20px rgba(0, 0, 0, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  border: 2px solid ${({ earned, rarity, theme }) => 
    !earned ? theme.colors.gray[200] :
    rarity === 'legendary' ? '#FFD700' :
    rarity === 'epic' ? '#9966CC' :
    rarity === 'rare' ? '#4169E1' :
    rarity === 'common' ? '#32CD32' :
    theme.colors.primary.main};
  position: relative;
  overflow: hidden;
  opacity: ${({ earned }) => earned ? 1 : 0.6};
`;

const BadgeGlow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ rarity }) => 
    rarity === 'legendary' ? 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)' :
    rarity === 'epic' ? 'radial-gradient(circle, rgba(153, 102, 204, 0.1) 0%, transparent 70%)' :
    rarity === 'rare' ? 'radial-gradient(circle, rgba(65, 105, 225, 0.1) 0%, transparent 70%)' :
    'transparent'};
  pointer-events: none;
`;

const BadgeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
`;

const BadgeIcon = styled.div`
  width: 56px;
  height: 56px;
  background: ${({ rarity, earned }) => 
    !earned ? '#E5E7EB' :
    rarity === 'legendary' ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
    rarity === 'epic' ? 'linear-gradient(135deg, #9966CC, #663399)' :
    rarity === 'rare' ? 'linear-gradient(135deg, #4169E1, #1E90FF)' :
    'linear-gradient(135deg, #32CD32, #228B22)'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ earned }) => earned ? 'white' : '#9CA3AF'};
  box-shadow: ${({ earned, rarity }) => 
    earned && rarity === 'legendary' ? '0 0 20px rgba(255, 215, 0, 0.5)' :
    earned && rarity === 'epic' ? '0 0 15px rgba(153, 102, 204, 0.4)' :
    earned && rarity === 'rare' ? '0 0 15px rgba(65, 105, 225, 0.4)' :
    '0 2px 8px rgba(0, 0, 0, 0.1)'};
`;

const BadgeInfo = styled.div`
  flex: 1;
`;

const BadgeName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme, earned }) => earned ? theme.colors.text.primary : theme.colors.text.secondary};
  margin-bottom: 4px;
`;

const BadgeRarity = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ rarity }) => 
    rarity === 'legendary' ? '#FFD700' :
    rarity === 'epic' ? '#9966CC' :
    rarity === 'rare' ? '#4169E1' :
    '#32CD32'};
  background: ${({ rarity }) => 
    rarity === 'legendary' ? 'rgba(255, 215, 0, 0.1)' :
    rarity === 'epic' ? 'rgba(153, 102, 204, 0.1)' :
    rarity === 'rare' ? 'rgba(65, 105, 225, 0.1)' :
    'rgba(50, 205, 50, 0.1)'};
  padding: 2px 6px;
  border-radius: 4px;
`;

const BadgeStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
`;

const BadgeDescription = styled.p`
  font-size: 14px;
  color: ${({ theme, earned }) => earned ? theme.colors.text.secondary : theme.colors.text.disabled};
  line-height: 1.4;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
`;

const BadgeProgress = styled.div`
  position: relative;
  z-index: 1;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background: ${({ theme }) => theme.colors.gray[200]};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: ${({ rarity }) => 
    rarity === 'legendary' ? 'linear-gradient(90deg, #FFD700, #FFA500)' :
    rarity === 'epic' ? 'linear-gradient(90deg, #9966CC, #663399)' :
    rarity === 'rare' ? 'linear-gradient(90deg, #4169E1, #1E90FF)' :
    'linear-gradient(90deg, #32CD32, #228B22)'};
  width: ${({ progress }) => progress}%;
  transition: width 0.5s ease;
`;

const LeaderboardSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

const LeaderboardItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: ${({ rank, theme }) => 
    rank === 1 ? 'linear-gradient(135deg, #FFD700, #FFA500)' :
    rank === 2 ? 'linear-gradient(135deg, #C0C0C0, #A8A8A8)' :
    rank === 3 ? 'linear-gradient(135deg, #CD7F32, #B8860B)' :
    theme.colors.gray[50]};
  color: ${({ rank }) => rank <= 3 ? 'white' : 'inherit'};
  border-radius: 12px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const LeaderboardRank = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ rank }) => 
    rank <= 3 ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
`;

const LeaderboardUser = styled.div`
  flex: 1;
  font-weight: 500;
`;

const LeaderboardScore = styled.div`
  font-weight: 700;
  font-size: 16px;
`;

const ChallengesSection = styled.div`
  margin-top: 24px;
`;

const ChallengesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ChallengeCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${({ theme, status }) => 
    status === 'completed' ? theme.colors.success.main :
    status === 'active' ? theme.colors.primary.main :
    theme.colors.gray[300]};
`;

const ChallengeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ChallengeTitle = styled.h5`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ChallengeReward = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.warning.main};
  background: ${({ theme }) => theme.colors.warning.light};
  padding: 4px 8px;
  border-radius: 4px;
`;

const ChallengeDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 16px;
  line-height: 1.4;
`;

const ChallengeProgressContainer = styled.div`
  margin-bottom: 12px;
`;

const ChallengeTimeLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const AchievementBadgesGamification = () => {
  const [activeTab, setActiveTab] = useState('badges');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showProgress, setShowProgress] = useState(true);

  // Mock user data
  const userStats = {
    level: 12,
    levelName: 'Smart Shopper',
    experience: 2850,
    nextLevelExp: 3000,
    totalBadges: 23,
    totalPoints: 15420,
    rank: 42,
    streakDays: 18
  };

  // Mock badges data
  const badges = [
    {
      id: 1,
      name: 'First Purchase',
      description: 'Complete your first purchase through the app',
      icon: ShoppingCart,
      rarity: 'common',
      earned: true,
      earnedDate: '2024-01-15',
      category: 'shopping',
      progress: 100,
      target: 1
    },
    {
      id: 2,
      name: 'Deal Hunter',
      description: 'Use 10 coupons or deals in a single month',
      icon: Target,
      rarity: 'rare',
      earned: true,
      earnedDate: '2024-02-20',
      category: 'savings',
      progress: 100,
      target: 10
    },
    {
      id: 3,
      name: 'Budget Master',
      description: 'Stay within budget for 3 consecutive months',
      icon: PiggyBank,
      rarity: 'epic',
      earned: false,
      category: 'budget',
      progress: 66,
      target: 3
    },
    {
      id: 4,
      name: 'Eco Warrior',
      description: 'Choose eco-friendly products 50 times',
      icon: Leaf,
      rarity: 'rare',
      earned: false,
      category: 'lifestyle',
      progress: 72,
      target: 50
    },
    {
      id: 5,
      name: 'Recipe Explorer',
      description: 'Try 25 AI-recommended recipes',
      icon: BookOpen,
      rarity: 'common',
      earned: true,
      earnedDate: '2024-03-10',
      category: 'recipes',
      progress: 100,
      target: 25
    },
    {
      id: 6,
      name: 'Legendary Saver',
      description: 'Save over $1000 in a single month using AI recommendations',
      icon: Crown,
      rarity: 'legendary',
      earned: false,
      category: 'savings',
      progress: 45,
      target: 1000
    },
    {
      id: 7,
      name: 'Streak Champion',
      description: 'Maintain a 30-day shopping streak',
      icon: Fire,
      rarity: 'epic',
      earned: false,
      category: 'engagement',
      progress: 60,
      target: 30
    },
    {
      id: 8,
      name: 'Social Shopper',
      description: 'Share 5 shopping lists with family members',
      icon: Users,
      rarity: 'common',
      earned: true,
      earnedDate: '2024-03-25',
      category: 'social',
      progress: 100,
      target: 5
    }
  ];

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: 'Sarah Johnson', score: 18450 },
    { rank: 2, name: 'Mike Chen', score: 16230 },
    { rank: 3, name: 'Emma Davis', score: 15890 },
    { rank: 4, name: 'Alex Smith', score: 15420 },
    { rank: 5, name: 'Lisa Wang', score: 14780 }
  ];

  // Mock challenges data
  const challenges = [
    {
      id: 1,
      title: 'Weekly Saver',
      description: 'Save $50 this week using AI recommendations',
      reward: 500,
      status: 'active',
      progress: 32,
      target: 50,
      timeLeft: '3 days',
      icon: DollarSign
    },
    {
      id: 2,
      title: 'Recipe Master',
      description: 'Try 3 new AI-recommended recipes this month',
      reward: 300,
      status: 'active',
      progress: 1,
      target: 3,
      timeLeft: '12 days',
      icon: BookOpen
    },
    {
      id: 3,
      title: 'Eco Champion',
      description: 'Choose 10 eco-friendly alternatives',
      reward: 400,
      status: 'completed',
      progress: 10,
      target: 10,
      timeLeft: 'Completed',
      icon: Leaf
    }
  ];

  const tabs = [
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'challenges', label: 'Challenges', icon: Target }
  ];

  const categories = [
    { id: 'all', label: 'All Badges' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'savings', label: 'Savings' },
    { id: 'budget', label: 'Budget' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'recipes', label: 'Recipes' },
    { id: 'engagement', label: 'Engagement' },
    { id: 'social', label: 'Social' }
  ];

  const filteredBadges = filterCategory === 'all' 
    ? badges 
    : badges.filter(badge => badge.category === filterCategory);

  const progressPercentage = (userStats.experience / userStats.nextLevelExp) * 100;

  const renderBadges = () => (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {categories.map(category => (
          <ActionButton
            key={category.id}
            variant={filterCategory === category.id ? 'primary' : 'default'}
            onClick={() => setFilterCategory(category.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.label}
          </ActionButton>
        ))}
      </div>

      <BadgesGrid>
        {filteredBadges.map(badge => {
          const IconComponent = badge.icon;
          return (
            <BadgeCard
              key={badge.id}
              earned={badge.earned}
              rarity={badge.rarity}
              whileHover={{ scale: badge.earned ? 1.02 : 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <BadgeGlow rarity={badge.rarity} />
              
              <BadgeHeader>
                <BadgeIcon earned={badge.earned} rarity={badge.rarity}>
                  <IconComponent size={28} />
                </BadgeIcon>
                
                <BadgeInfo>
                  <BadgeName earned={badge.earned}>{badge.name}</BadgeName>
                  <BadgeRarity rarity={badge.rarity}>{badge.rarity}</BadgeRarity>
                  
                  <BadgeStatus>
                    {badge.earned ? (
                      <>
                        <Check size={12} style={{ color: '#10B981' }} />
                        <span style={{ fontSize: '12px', color: '#10B981' }}>
                          Earned {badge.earnedDate}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock size={12} style={{ color: '#9CA3AF' }} />
                        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                          In Progress
                        </span>
                      </>
                    )}
                  </BadgeStatus>
                </BadgeInfo>
              </BadgeHeader>
              
              <BadgeDescription earned={badge.earned}>
                {badge.description}
              </BadgeDescription>
              
              {!badge.earned && (
                <BadgeProgress>
                  <ProgressLabel>
                    <span>Progress</span>
                    <span>{badge.progress}% ({Math.floor(badge.target * badge.progress / 100)}/{badge.target})</span>
                  </ProgressLabel>
                  <ProgressBarContainer>
                    <ProgressBarFill progress={badge.progress} rarity={badge.rarity} />
                  </ProgressBarContainer>
                </BadgeProgress>
              )}
            </BadgeCard>
          );
        })}
      </BadgesGrid>
    </div>
  );

  const renderLeaderboard = () => (
    <LeaderboardSection>
      <ChartTitle style={{ marginBottom: '20px' }}>
        <Trophy size={20} />
        Top Performers This Month
      </ChartTitle>
      
      {leaderboard.map(user => (
        <LeaderboardItem key={user.rank} rank={user.rank}>
          <LeaderboardRank rank={user.rank}>
            {user.rank <= 3 ? (
              user.rank === 1 ? <Crown size={16} /> :
              user.rank === 2 ? <Medal size={16} /> :
              <Award size={16} />
            ) : (
              user.rank
            )}
          </LeaderboardRank>
          
          <LeaderboardUser>
            {user.name}
            {user.rank === 4 && <span style={{ fontSize: '12px', opacity: 0.7 }}> (You)</span>}
          </LeaderboardUser>
          
          <LeaderboardScore>
            {user.score.toLocaleString()} pts
          </LeaderboardScore>
        </LeaderboardItem>
      ))}
    </LeaderboardSection>
  );

  const renderChallenges = () => (
    <ChallengesSection>
      <ChallengesList>
        {challenges.map(challenge => {
          const IconComponent = challenge.icon;
          return (
            <ChallengeCard
              key={challenge.id}
              status={challenge.status}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ChallengeHeader>
                <ChallengeTitle>
                  <IconComponent size={16} style={{ marginRight: '8px', display: 'inline' }} />
                  {challenge.title}
                </ChallengeTitle>
                
                <ChallengeReward>
                  <Star size={12} />
                  {challenge.reward} pts
                </ChallengeReward>
              </ChallengeHeader>
              
              <ChallengeDescription>
                {challenge.description}
              </ChallengeDescription>
              
              <ChallengeProgressContainer>
                <ProgressLabel>
                  <span>Progress</span>
                  <span>{challenge.progress}/{challenge.target}</span>
                </ProgressLabel>
                <ProgressBarContainer>
                  <ProgressBarFill 
                    progress={(challenge.progress / challenge.target) * 100} 
                    rarity="common"
                  />
                </ProgressBarContainer>
              </ChallengeProgressContainer>
              
              <ChallengeTimeLeft>
                <Clock size={12} />
                {challenge.timeLeft}
              </ChallengeTimeLeft>
            </ChallengeCard>
          );
        })}
      </ChallengesList>
    </ChallengesSection>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'badges':
        return renderBadges();
      case 'leaderboard':
        return renderLeaderboard();
      case 'challenges':
        return renderChallenges();
      default:
        return renderBadges();
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
            <Trophy size={18} />
          </IconWrapper>
          Achievements & Rewards
        </Title>
        
        <ActionButtons>
          <ActionButton variant="secondary">
            <Share2 size={14} />
            Share Progress
          </ActionButton>
          <ActionButton variant="primary">
            <Gift size={14} />
            Claim Rewards
          </ActionButton>
        </ActionButtons>
      </Header>

      <Content>
        {/* User Stats Overview */}
        <UserStats>
          <UserStatsBackground />
          
          <UserLevel>
            <LevelBadge>{userStats.level}</LevelBadge>
            
            <LevelInfo>
              <LevelTitle>Level {userStats.level} - {userStats.levelName}</LevelTitle>
              <LevelDescription>
                You're doing great! Keep shopping smart to reach the next level.
              </LevelDescription>
              
              <ProgressContainer>
                <ProgressBar progress={progressPercentage} />
              </ProgressContainer>
              
              <ProgressText>
                <span>{userStats.experience} / {userStats.nextLevelExp} XP</span>
                <span>{userStats.nextLevelExp - userStats.experience} XP to next level</span>
              </ProgressText>
            </LevelInfo>
          </UserLevel>
          
          <StatsGrid>
            <StatCard>
              <StatValue>{userStats.totalBadges}</StatValue>
              <StatLabel>Badges</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{userStats.totalPoints.toLocaleString()}</StatValue>
              <StatLabel>Points</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>#{userStats.rank}</StatValue>
              <StatLabel>Global Rank</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{userStats.streakDays}</StatValue>
              <StatLabel>Day Streak</StatLabel>
            </StatCard>
          </StatsGrid>
        </UserStats>

        {/* Tab Navigation */}
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

        {/* Tab Content */}
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

const ChartTitle = styled.h4`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

export default AchievementBadgesGamification;
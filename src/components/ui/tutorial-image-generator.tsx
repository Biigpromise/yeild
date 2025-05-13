
import React from "react";
import { Sparkles, BarChart3, ListTodo, Wallet, Trophy, Users, BarChart, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TutorialImageGeneratorProps {
  section: string;
}

export const TutorialImageGenerator: React.FC<TutorialImageGeneratorProps> = ({ section }) => {
  // Create styled placeholder images for each section
  const renderSection = () => {
    switch (section) {
      case "dashboard":
        return (
          <div className="p-6 bg-gray-900 rounded-lg space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-yeild-yellow">Your Dashboard</h3>
              <BarChart3 className="h-8 w-8 text-yeild-yellow" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">Total Points</p>
                <p className="text-2xl font-bold text-white">1,250</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">Tasks Completed</p>
                <p className="text-2xl font-bold text-white">24</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">Current Level</p>
                <p className="text-2xl font-bold text-white">5</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400">Earnings</p>
                <p className="text-2xl font-bold text-white">$45.75</p>
              </div>
            </div>
          </div>
        );
        
      case "tasks":
        return (
          <div className="p-6 bg-gray-900 rounded-lg space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-yeild-yellow">Available Tasks</h3>
              <ListTodo className="h-8 w-8 text-yeild-yellow" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium text-white">Complete Survey {i}</p>
                  <p className="text-sm text-gray-400">5 min • 50 points</p>
                </div>
                <Button size="sm" className="bg-yeild-yellow text-black">Start</Button>
              </div>
            ))}
          </div>
        );
        
      case "wallet":
        return (
          <div className="p-6 bg-gray-900 rounded-lg space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-yeild-yellow">Your Wallet</h3>
              <Wallet className="h-8 w-8 text-yeild-yellow" />
            </div>
            <div className="p-6 bg-gray-800 rounded-lg text-center">
              <p className="text-sm text-gray-400">Available Balance</p>
              <p className="text-3xl font-bold text-white">$78.50</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button className="bg-yeild-yellow text-black">Withdraw</Button>
              <Button variant="outline">History</Button>
            </div>
          </div>
        );
        
      case "leaderboard":
        return (
          <div className="p-6 bg-gray-900 rounded-lg space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-yeild-yellow">Leaderboard</h3>
              <Trophy className="h-8 w-8 text-yeild-yellow" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold">
                    {i}
                  </div>
                  <p className="font-medium text-white">User{i}</p>
                </div>
                <p className="text-yeild-yellow font-bold">{9000 - i * 1000} pts</p>
              </div>
            ))}
          </div>
        );
        
      case "referrals":
        return (
          <div className="p-6 bg-gray-900 rounded-lg space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-yeild-yellow">Referral Program</h3>
              <Users className="h-8 w-8 text-yeild-yellow" />
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-400">Your Referral Code</p>
              <div className="flex gap-2 items-center mt-1">
                <div className="bg-gray-700 p-2 rounded flex-1 text-center font-mono">
                  YEILD123
                </div>
                <Button size="sm" variant="outline">Copy</Button>
              </div>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-400">Friends Referred</p>
                <p className="text-xl font-bold text-white">5</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Bonus Earned</p>
                <p className="text-xl font-bold text-yeild-yellow">$15.25</p>
              </div>
            </div>
          </div>
        );
        
      case "level-up":
        return (
          <div className="p-6 bg-gray-900 rounded-lg space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-yeild-yellow">Level Up System</h3>
              <BarChart className="h-8 w-8 text-yeild-yellow" />
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-gray-800 text-gray-300">
                    Level 5
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-gray-300">
                    72%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-800">
                <div style={{ width: "72%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yeild-yellow"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-2 bg-gray-800 rounded-lg text-center">
                  <Award className="h-5 w-5 text-yeild-yellow mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Reward {i}</p>
                </div>
              ))}
            </div>
          </div>
        );
        
      case "congrats":
        return (
          <div className="p-6 bg-gray-900 rounded-lg flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-yeild-yellow flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-xl font-bold text-yeild-yellow text-center">Congratulations!</h3>
            <p className="text-sm text-gray-300 text-center">
              You're all set to start earning rewards with YEILD. Happy earning!
            </p>
            <Button className="bg-yeild-yellow text-black mt-4">Start Earning</Button>
          </div>
        );
        
      default:
        return (
          <div className="h-full w-full flex items-center justify-center">
            <Sparkles className="h-16 w-16 text-yeild-yellow" />
          </div>
        );
    }
  };

  return (
    <div className="w-full aspect-[16/9] bg-black rounded-lg overflow-hidden shadow-lg border border-gray-800">
      {renderSection()}
    </div>
  );
};

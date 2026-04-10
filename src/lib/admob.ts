import { AdMob, AdmobConsentStatus, AdOptions, RewardAdOptions, RewardAdPluginEvents } from '@capacitor-community/admob';

const REWARD_AD_UNIT_ID = 'ca-app-pub-6164275748012588/8184155116';
// 테스트용: 'ca-app-pub-3940256099942544/5224354917'

let initialized = false;

export async function initAdMob(): Promise<void> {
  if (initialized) return;
  try {
    await AdMob.initialize({
      initializeForTesting: false,
    });
    initialized = true;
  } catch (e) {
    console.warn('AdMob 초기화 실패 (웹에서는 지원되지 않음):', e);
  }
}

export async function showRewardAd(): Promise<boolean> {
  try {
    await initAdMob();

    const options: RewardAdOptions = {
      adId: REWARD_AD_UNIT_ID,
    };

    return new Promise<boolean>(async (resolve) => {
      const rewardHandle = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded,
        () => {
          rewardHandle.remove();
          dismissHandle.remove();
          resolve(true);
        }
      );

      const dismissHandle = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        () => {
          rewardHandle.remove();
          dismissHandle.remove();
          resolve(false);
        }
      );

      try {
        await AdMob.prepareRewardVideoAd(options);
        await AdMob.showRewardVideoAd();
      } catch (e) {
        rewardHandle.remove();
        dismissHandle.remove();
        console.error('리워드 광고 표시 실패:', e);
        resolve(false);
      }
    });
  } catch (e) {
    console.error('AdMob 리워드 광고 오류:', e);
    return false;
  }
}

/**
 * 웹 환경인지 확인 (Capacitor 네이티브가 아닌 경우)
 */
export function isNativePlatform(): boolean {
  try {
    return typeof (window as any).Capacitor !== 'undefined' &&
      (window as any).Capacitor.isNativePlatform?.();
  } catch {
    return false;
  }
}

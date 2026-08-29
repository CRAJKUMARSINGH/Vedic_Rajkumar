
import {
  classifyQuestion,
  HOUSE_SIGNIFICATIONS,
  analyzeQuestion,
  getHoraLord,
} from '@/services/questionAnalysisService';

describe('Question Analysis Service', () => {
  describe('classifyQuestion', () => {
    // House 1: Self/Health
    it('should classify a health question as House 1', () => {
      expect(classifyQuestion('How is my overall health this year?').house).toBe(1);
      expect(classifyQuestion('Will I recover from my current illness?').house).toBe(1);
      expect(classifyQuestion('How will my energy levels be in the coming months?').house).toBe(1);
    });

    // House 2: Wealth/Family
    it('should classify wealth/finance questions as House 2', () => {
      expect(classifyQuestion('Will my income increase this year?').house).toBe(2);
      expect(classifyQuestion('Should I invest in fixed deposits now?').house).toBe(2);
      expect(classifyQuestion('How will my family finances be?').house).toBe(2);
    });

    // House 3: Siblings/Courage
    it('should classify sibling/courage questions as House 3', () => {
      expect(classifyQuestion('Will my brother get a good job?').house).toBe(3);
      expect(classifyQuestion('Should I take that brave step in my career?').house).toBe(3);
      expect(classifyQuestion('How will my communication skills improve?').house).toBe(3);
    });

    // House 4: Home/Mother/Property
    it('should classify home/property/mother questions as House4', () => {
      expect(classifyQuestion('Should I buy a new house this year?').house).toBe(4);
      expect(classifyQuestion('How is my mother\'s health?').house).toBe(4);
      expect(classifyQuestion('When should I purchase a new car?').house).toBe(4);
    });

    // House 5: Children/Education/Love
    it('should classify children/education/love questions as House5', () => {
      expect(classifyQuestion('Will I pass my final exam?').house).toBe(5);
      expect(classifyQuestion('When will I have my first child?').house).toBe(5);
      expect(classifyQuestion('Is this the right time to propose?').house).toBe(5);
    });

    // House 6: Enemies/Disease/Debt/Job
    it('should classify enemies/disease/debt/job questions as House6', () => {
      expect(classifyQuestion('Will my legal battle be successful?').house).toBe(6);
      expect(classifyQuestion('When will I get rid of my debts?').house).toBe(6);
      expect(classifyQuestion('How will my relationship with my coworkers be?').house).toBe(6);
    });

    // House 7: Marriage/Partnership/Spouse
    it('should classify marriage/partnership questions as House7', () => {
      expect(classifyQuestion('When will I get married?').house).toBe(7);
      expect(classifyQuestion('Should I start a business with this partner?').house).toBe(7);
      expect(classifyQuestion('How will my married life be with them?').house).toBe(7);
    });

    // House8: Longevity/Obstacles/Secret/Occult
    it('should classify longevity/secret/obstacle questions as House8', () => {
      expect(classifyQuestion('What is the secret behind this problem?').house).toBe(8);
      expect(classifyQuestion('Will I inherit property from my grandparents?').house).toBe(8);
      expect(classifyQuestion('Should I learn occult sciences now?').house).toBe(8);
    });

    // House9: Fortune/Father/Travel/Spirituality
    it('should classify fortune/father/travel/spirituality questions as House9', () => {
      expect(classifyQuestion('Will I go abroad this year?').house).toBe(9);
      expect(classifyQuestion('How is my father\'s current health?').house).toBe(9);
      expect(classifyQuestion('Will my fortune favor me in this venture?').house).toBe(9);
    });

    // House10: Career/Profession/Fame
    it('should classify career/profession/fame questions as House10', () => {
      expect(classifyQuestion('Will I get a promotion at work?').house).toBe(10);
      expect(classifyQuestion('Should I switch jobs now?').house).toBe(10);
      expect(classifyQuestion('Will I become famous in my field?').house).toBe(10);
    });

    // House11: Gains/Friends/Wishes
    it('should classify gains/friends/wishes questions as House11', () => {
      expect(classifyQuestion('Will all my wishes be fulfilled?').house).toBe(11);
      expect(classifyQuestion('How will my friendships evolve?').house).toBe(11);
      expect(classifyQuestion('When will I see unexpected gains in my business?').house).toBe(11);
    });

    // House12: Loss/Foreign/Moksha/Expense
    it('should classify loss/foreign/moksha/expense questions as House12', () => {
      expect(classifyQuestion('Will I settle abroad permanently?').house).toBe(12);
      expect(classifyQuestion('Will I have to incur big expenses this year?').house).toBe(12);
      expect(classifyQuestion('How is my spiritual growth progressing?').house).toBe(12);
    });
  });

  describe('analyzeQuestion', () => {
    const testDate = new Date('2024-05-20T14:30:00Z');
    const testLocation = { lat: 28.6139, lon: 77.209, label: 'New Delhi' };
    
    it('should analyze questions for anonymous users (only question time)', async () => {
      const result = await analyzeQuestion({
        question: 'Will I get married this year?',
        questionTime: testDate,
        questionLocation: testLocation,
      });
      
      expect(result).toBeDefined();
      expect(result.mode).toBe('prasna');
      expect(result.category.house).toBe(7);
      expect(result.answer).toBeDefined();
    });

    it('should analyze questions for users with saved birth data', async () => {
      const result = await analyzeQuestion({
        question: 'Will I get a promotion at work?',
        questionTime: testDate,
        questionLocation: testLocation,
        natal: {
          name: 'Test User',
          date: '1990-01-15',
          time: '08:00',
          lat: 28.6139,
          lon: 77.209,
        },
      });
      
      expect(result).toBeDefined();
      expect(result.mode).toBe('natal+transit');
      expect(result.jatakName).toBe('Test User');
      expect(result.category.house).toBe(10);
    });
  });

  describe('getHoraLord', () => {
    it('should calculate hora lord without errors', () => {
      const result = getHoraLord(new Date());
      expect(result).toBeDefined();
      expect(result.lord).toBeDefined();
      expect(result.dayLord).toBeDefined();
    });
  });
});

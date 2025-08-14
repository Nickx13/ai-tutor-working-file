import Papa from 'papaparse';

class CSVQuestionService {
    constructor() {
        this.questions = [];
        this.loaded = false;
    }

    async loadQuestions(csvFile = '/questions.csv') {
        if (this.loaded && this.questions.length > 0) return this.questions;
        
        try {
            console.log('Attempting to fetch CSV from:', csvFile);
            const response = await fetch(csvFile);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const csvText = await response.text();
            console.log('CSV text loaded, length:', csvText.length);

            if (!csvText.trim()) {
                throw new Error('CSV file is empty');
            }

            const result = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                transform: (value, field) => {
                    if (field === 'id') return parseInt(value) || 0;
                    return value ? value.toString().trim() : '';
                }
            });

            console.log('Papa parse result:', result);
            console.log('Parse errors:', result.errors);

            this.questions = result.data
                .filter(row => {
                    return row.id && row.class && row.subject && row.topic && row.question_text;
                })
                .map(row => ({
                    id: parseInt(row.id),
                    class: row.class.toString().trim(),
                    subject: row.subject.toLowerCase().trim(),
                    topic: row.topic.toLowerCase().trim(),
                    difficulty: row.difficulty ? row.difficulty.toLowerCase().trim() : 'medium',
                    text: row.question_text.trim(),
                    options: {
                        A: row.option_a ? row.option_a.trim() : '',
                        B: row.option_b ? row.option_b.trim() : '',
                        C: row.option_c ? row.option_c.trim() : '',
                        D: row.option_d ? row.option_d.trim() : ''
                    },
                    correctAnswer: row.correct_answer ? row.correct_answer.trim() : 'A',
                    explanation: row.explanation ? row.explanation.trim() : ''
                }));

            console.log('Final questions array length:', this.questions.length);
            
            // Debug: Show difficulty distribution
            const difficultyCount = {};
            this.questions.forEach(q => {
                difficultyCount[q.difficulty] = (difficultyCount[q.difficulty] || 0) + 1;
            });
            console.log('Difficulty distribution:', difficultyCount);
            
            this.loaded = true;
            return this.questions;
        } catch (error) {
            console.error('Error loading questions:', error);
            throw error;
        }
    }

    getQuestions(filters = {}) {
        console.log('🚨 EMERGENCY DEBUG: What filters are being passed?');
        console.log('🚨 Raw filters object:', JSON.stringify(filters, null, 2));
        console.log('🚨 Filter keys:', Object.keys(filters));
        console.log('🚨 Topic value:', filters.topic);
        console.log('🚨 Topics value:', filters.topics);
        
        console.log('🔍 === TOPIC FILTER DEBUG ===');
        console.log('🎯 Input filters:', filters);
        console.log('📊 Available questions:', this.questions.length);
        
        const { class: cls, subject, topics, topic, difficulty, limit = 1000 } = filters;
        let filtered = [...this.questions]; // Create a copy
        
        // Apply class filter
        if (cls) {
            const classStr = cls.toString().trim();
            console.log('🏫 Applying class filter:', classStr);
            filtered = filtered.filter(q => {
                const match = q.class === classStr;
                return match;
            });
            console.log(`✅ After class filter (${classStr}): ${filtered.length} questions`);
        }
        
        // Apply subject filter
        if (subject) {
            const subjectStr = subject.toLowerCase().trim();
            console.log('📚 Applying subject filter:', subjectStr);
            filtered = filtered.filter(q => {
                const match = q.subject === subjectStr;
                return match;
            });
            console.log(`✅ After subject filter (${subjectStr}): ${filtered.length} questions`);
        }
        
        // CRITICAL: Topic filter debug - this is where the issue is!
        console.log('📖 === TOPIC FILTER ANALYSIS ===');
        console.log('📖 Topic filter data:', { topics, topic });
        console.log('📖 Available topics in current filtered set:', [...new Set(filtered.map(q => q.topic))]);
        
        if (topics && Array.isArray(topics) && topics.length > 0) {
            const topicsNormalized = topics.map(t => t.toLowerCase().trim());
            console.log('📖 Applying ARRAY topics filter:', topicsNormalized);
            
            // Show each question's topic before filtering
            console.log('📖 Questions before topic filter:');
            filtered.forEach(q => {
                console.log(`   ID: ${q.id}, Topic: "${q.topic}", Difficulty: "${q.difficulty}"`);
            });
            
            filtered = filtered.filter(q => {
                const match = topicsNormalized.includes(q.topic);
                console.log(`   Question ${q.id}: topic "${q.topic}" in [${topicsNormalized.join(', ')}]? ${match}`);
                return match;
            });
            console.log(`✅ After topics filter (${topicsNormalized.join(', ')}): ${filtered.length} questions`);
            
        } else if (topic) {
            const topicStr = topic.toLowerCase().trim();
            console.log('📖 Applying SINGLE topic filter:', topicStr);
            
            // Show each question's topic before filtering
            console.log('📖 Questions before topic filter:');
            filtered.forEach(q => {
                console.log(`   ID: ${q.id}, Topic: "${q.topic}", Difficulty: "${q.difficulty}"`);
            });
            
            filtered = filtered.filter(q => {
                const match = q.topic === topicStr;
                console.log(`   Question ${q.id}: "${q.topic}" === "${topicStr}"? ${match}`);
                return match;
            });
            console.log(`✅ After topic filter (${topicStr}): ${filtered.length} questions`);
        } else {
            console.log('❌ NO TOPIC FILTER APPLIED! This might be the issue!');
            console.log('❌ topics:', topics, 'topic:', topic);
        }
        
        // Apply difficulty filter
        if (difficulty) {
            const difficultyStr = difficulty.toLowerCase().trim();
            console.log('⭐ Applying difficulty filter:', difficultyStr);
            console.log('⭐ Available difficulties in filtered set:', [...new Set(filtered.map(q => q.difficulty))]);
            
            filtered = filtered.filter(q => {
                const match = q.difficulty === difficultyStr;
                if (!match) {
                    console.log(`   Question ${q.id}: difficulty "${q.difficulty}" ≠ "${difficultyStr}"`);
                }
                return match;
            });
            console.log(`✅ After difficulty filter (${difficultyStr}): ${filtered.length} questions`);
        }
        
        console.log('🏁 === FINAL RESULTS ===');
        console.log('🏁 Final filtered questions:', filtered.length);
        
        // Show ALL final questions for verification
        if (filtered.length > 0) {
            console.log('🏁 ALL filtered questions:');
            filtered.forEach(q => {
                console.log(`   ID: ${q.id}, Class: ${q.class}, Subject: ${q.subject}, Topic: "${q.topic}", Difficulty: "${q.difficulty}"`);
                console.log(`       Text: "${q.text.substring(0, 80)}..."`);
            });
        }
        
        console.log('🔍 === END TOPIC FILTER DEBUG ===');
        
        // Return the exact filtered results
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(filtered.length, limit === 1000 ? filtered.length : limit));
    }

    getTopics(subject, classNumber = null) {
        console.log('=== getTopics DEBUG ===');
        console.log('Input - Subject:', subject, 'Class:', classNumber);
        console.log('Total questions available:', this.questions.length);
        
        const subjectNormalized = subject ? subject.toLowerCase().trim() : '';
        const classNormalized = classNumber ? classNumber.toString().trim() : null;
        
        console.log('Normalized - Subject:', subjectNormalized, 'Class:', classNormalized);
        
        let subjectQuestions = this.questions.filter(q => q.subject === subjectNormalized);
        console.log('Questions after subject filter:', subjectQuestions.length);
        
        if (classNormalized) {
            subjectQuestions = subjectQuestions.filter(q => q.class === classNormalized);
            console.log('Questions after class filter:', subjectQuestions.length);
        }
        
        const topicCounts = {};
        subjectQuestions.forEach(q => {
            if (!topicCounts[q.topic]) {
                topicCounts[q.topic] = 0;
            }
            topicCounts[q.topic]++;
        });
        
        console.log('Topic counts:', topicCounts);
        
        const topics = Object.keys(topicCounts).map(topicKey => {
            const questionCount = topicCounts[topicKey];
            return {
                id: topicKey,
                name: topicKey.charAt(0).toUpperCase() + topicKey.slice(1),
                questions: questionCount,
                xp: questionCount * 10
            };
        });
        
        console.log('Final topics result:', topics);
        console.log('=== END getTopics DEBUG ===');
        
        return topics;
    }

    getSubjects(classNumber = null) {
        let questions = this.questions;
        
        if (classNumber) {
            const classNormalized = classNumber.toString().trim();
            questions = questions.filter(q => q.class === classNormalized);
        }
        
        const subjectCounts = {};
        questions.forEach(q => {
            if (!subjectCounts[q.subject]) {
                subjectCounts[q.subject] = 0;
            }
            subjectCounts[q.subject]++;
        });
        
        return Object.keys(subjectCounts).map(subject => ({
            id: subject,
            name: subject.charAt(0).toUpperCase() + subject.slice(1),
            questions: subjectCounts[subject]
        }));
    }

    getClasses() {
        const classCounts = {};
        this.questions.forEach(q => {
            if (!classCounts[q.class]) {
                classCounts[q.class] = 0;
            }
            classCounts[q.class]++;
        });
        
        return Object.keys(classCounts)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(cls => ({
                id: cls,
                name: `Class ${cls}`,
                questions: classCounts[cls]
            }));
    }

    getDifficulties(filters = {}) {
        const { class: cls, subject, topics, topic } = filters;
        let filtered = this.questions;
        
        if (cls) {
            const classStr = cls.toString().trim();
            filtered = filtered.filter(q => q.class === classStr);
        }
        if (subject) {
            const subjectStr = subject.toLowerCase().trim();
            filtered = filtered.filter(q => q.subject === subjectStr);
        }
        if (topics && Array.isArray(topics) && topics.length > 0) {
            const topicsNormalized = topics.map(t => t.toLowerCase().trim());
            filtered = filtered.filter(q => topicsNormalized.includes(q.topic));
        } else if (topic) {
            const topicStr = topic.toLowerCase().trim();
            filtered = filtered.filter(q => q.topic === topicStr);
        }
        
        const difficultyCounts = {};
        filtered.forEach(q => {
            if (!difficultyCounts[q.difficulty]) {
                difficultyCounts[q.difficulty] = 0;
            }
            difficultyCounts[q.difficulty]++;
        });
        
        return Object.keys(difficultyCounts).map(difficulty => ({
            id: difficulty,
            name: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
            questions: difficultyCounts[difficulty]
        }));
    }

    getStatistics() {
        const stats = {
            totalQuestions: this.questions.length,
            classes: this.getClasses(),
            subjects: [...new Set(this.questions.map(q => q.subject))],
            topics: [...new Set(this.questions.map(q => q.topic))],
            difficulties: [...new Set(this.questions.map(q => q.difficulty))],
            questionsByClass: {},
            questionsBySubject: {},
            questionsByTopic: {},
            questionsByDifficulty: {}
        };

        this.questions.forEach(q => {
            if (!stats.questionsByClass[q.class]) {
                stats.questionsByClass[q.class] = 0;
            }
            stats.questionsByClass[q.class]++;

            if (!stats.questionsBySubject[q.subject]) {
                stats.questionsBySubject[q.subject] = 0;
            }
            stats.questionsBySubject[q.subject]++;

            if (!stats.questionsByTopic[q.topic]) {
                stats.questionsByTopic[q.topic] = 0;
            }
            stats.questionsByTopic[q.topic]++;

            if (!stats.questionsByDifficulty[q.difficulty]) {
                stats.questionsByDifficulty[q.difficulty] = 0;
            }
            stats.questionsByDifficulty[q.difficulty]++;
        });

        return stats;
    }

    searchQuestions(searchTerm, filters = {}) {
        const { class: cls, subject, topics, topic, difficulty } = filters;
        let filtered = this.questions;
        
        if (cls) {
            const classStr = cls.toString().trim();
            filtered = filtered.filter(q => q.class === classStr);
        }
        if (subject) {
            const subjectStr = subject.toLowerCase().trim();
            filtered = filtered.filter(q => q.subject === subjectStr);
        }
        if (topics && Array.isArray(topics) && topics.length > 0) {
            const topicsNormalized = topics.map(t => t.toLowerCase().trim());
            filtered = filtered.filter(q => topicsNormalized.includes(q.topic));
        } else if (topic) {
            const topicStr = topic.toLowerCase().trim();
            filtered = filtered.filter(q => q.topic === topicStr);
        }
        if (difficulty) {
            const difficultyStr = difficulty.toLowerCase().trim();
            filtered = filtered.filter(q => q.difficulty === difficultyStr);
        }

        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(q => 
                q.text.toLowerCase().includes(term) ||
                Object.values(q.options).some(option => 
                    option.toLowerCase().includes(term)
                ) ||
                (q.explanation && q.explanation.toLowerCase().includes(term))
            );
        }

        return filtered;
    }
}

export const csvQuestionService = new CSVQuestionService();

<template>
  <div id="app">
    <h1>Spanische Verben lernen</h1>
    <div>
      <button
        v-for="(lesson, index) in lessons"
        :key="index"
        @click="selectLesson(index)"
      >
        {{ lesson.name }}
        <div
          :style="getPercentageStyle(lessonCompletionPercentage(lesson))"
          class="percentage"
        >
          {{ lessonCompletionPercentage(lesson) }}%
        </div>
      </button>
    </div>
    <Lesson
      v-if="selectedLesson !== null"
      :key="selectedLesson.id"
      :verbs="selectedVerbs"
      :num-questions="numQuestions"
      @lessonComplete="showStatistics"
      @updateStatistics="updateStatistics"
    />
    <div v-if="statisticsVisible">
      <h2>Statistik</h2>
      <p>Richtige Antworten: {{ correctAnswers }}</p>
      <p>Falsche Antworten: {{ numQuestions - correctAnswers }}</p>
      <h3>Gesamtstatistik</h3>
      <ul>
        <li v-for="(verb, index) in selectedVerbs" :key="index">
          {{ verb.prompt }}: Richtig {{ verb.correct }} | Falsch
          {{ verb.wrong }}
        </li>
      </ul>
      <button @click="resetLesson">Neue Lektion starten</button>
    </div>
  </div>
</template>

<script>
import Lesson from './components/Lesson.vue';
import { supabase } from './supabase';

export default {
  name: 'App',
  components: {
    Lesson,
  },
  data() {
    return {
      lessons: [],
      selectedLesson: null,
      selectedVerbs: [],
      statisticsVisible: false,
      correctAnswers: 0,
      numQuestions: 7, // Variable für die Anzahl der Fragen
    };
  },
  mounted() {
    this.loadLessons();
  },
  methods: {
    async loadLessons() {
      let { data: lessons, error } = await supabase
        .from('lessons')
        .select('id, name, verbs:verbs(id, prompt, answer, correct, wrong)');
      if (error) {
        console.error('Error loading lessons:', error);
      } else {
        this.lessons = lessons;
      }
    },
    selectLesson(index) {
      this.resetState();
      this.selectedLesson = this.lessons[index];
      this.statisticsVisible = false;
      this.correctAnswers = 0;
      this.selectedVerbs = this.getWeightedRandomVerbs(
        this.lessons[index].verbs,
        this.numQuestions
      );
    },
    getWeightedRandomVerbs(verbs, numQuestions) {
      const totalWeight = verbs.reduce((total, verb) => {
        const weight = (verb.wrong + 1) / (verb.correct + 1);
        verb.weight = weight;
        return total + weight;
      }, 0);

      const selectedVerbs = [];
      for (let i = 0; i < numQuestions; i++) {
        const random = Math.random() * totalWeight;
        let cumulativeWeight = 0;
        for (const verb of verbs) {
          cumulativeWeight += verb.weight;
          if (random < cumulativeWeight) {
            selectedVerbs.push(verb);
            break;
          }
        }
      }

      return selectedVerbs;
    },
    showStatistics(correctAnswers) {
      this.correctAnswers = correctAnswers;
      this.statisticsVisible = true;
    },
    resetLesson() {
      this.statisticsVisible = false;
      this.selectedLesson = null;
      this.selectedVerbs = [];
    },
    async updateStatistics(verbIndex, isCorrect) {
      const verb = this.selectedVerbs[verbIndex];
      const newCorrect = isCorrect ? verb.correct + 1 : verb.correct;
      const newWrong = isCorrect ? verb.wrong : verb.wrong + 1;

      let { error } = await supabase
        .from('verbs')
        .update({ correct: newCorrect, wrong: newWrong })
        .eq('id', verb.id);

      if (error) {
        console.error('Error updating verb:', error);
      } else {
        verb.correct = newCorrect;
        verb.wrong = newWrong;
      }
    },
    resetState() {
      this.correctAnswers = 0;
      this.selectedVerbs = [];
    },
    lessonCompletionPercentage(lesson) {
      if (!lesson.verbs || lesson.verbs.length === 0) {
        return 0;
      }

      const totalVerbs = lesson.verbs.length;
      const correctVerbs = lesson.verbs.filter(
        (verb) => verb.correct > verb.wrong
      ).length;
      return ((correctVerbs / totalVerbs) * 100).toFixed(2);
    },
    getPercentageStyle(percentage) {
      const red = 40 + (100 - percentage) * 1.5; // Noch dunkleres Rot
      const green = 40 + percentage * 1.5; // Noch dunkleres Grün
      return {
        backgroundColor: `rgb(${red}, ${green}, 40)`,
        color: 'white',
        padding: '5px',
        borderRadius: '5px',
        display: 'inline-block',
        marginLeft: '10px',
      };
    },
  },
};
</script>

<style>
body {
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Arial', sans-serif;
}

button {
  margin: 10px;
  padding: 10px;
  background-color: #333;
  color: #d4d4d4;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #444;
}

.percentage {
  display: inline-block;
  padding: 5px;
  color: white;
  border-radius: 5px;
}
</style>

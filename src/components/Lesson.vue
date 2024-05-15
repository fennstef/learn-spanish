<template>
  <div>
    <h2>Lektion</h2>
    <div v-if="currentQuestionIndex < numQuestions">
      <p>Frage {{ currentQuestionIndex + 1 }} von {{ numQuestions }}</p>
      <p>{{ verbs[currentQuestionIndex].prompt }}</p>
      <input v-model="userAnswer" @keyup.enter="submitAnswer" />
      <button @click="submitAnswer" style="margin-top: 10px">
        Antwort prüfen
      </button>
      <p v-if="feedback !== null" style="margin-top: 10px">
        <span v-if="feedback" style="color: green">Richtig!</span>
        <span v-else style="color: red"
          >Falsch! Die richtige Antwort ist: {{ correctAnswer }}</span
        >
      </p>
    </div>
    <div v-else>
      <h3>Lektion abgeschlossen!</h3>
      <p>
        Du hast {{ correctAnswers }} von {{ numQuestions }} Fragen richtig
        beantwortet.
      </p>
      <button @click="completeLesson">Statistik anzeigen</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Lesson',
  props: ['verbs', 'numQuestions'],
  data() {
    return {
      currentQuestionIndex: 0,
      userAnswer: '',
      correctAnswers: 0,
      feedback: null,
      correctAnswer: '',
      hasAnsweredWrong: false, // Neue Variable, um falsche Antworten zu verfolgen
    };
  },
  watch: {
    currentQuestionIndex(newValue) {
      if (newValue >= this.numQuestions) {
        this.completeLesson();
      }
    },
  },
  methods: {
    submitAnswer() {
      const correctAnswer =
        this.verbs[this.currentQuestionIndex].answer.toLowerCase();
      const isCorrect = this.userAnswer.toLowerCase() === correctAnswer;
      this.correctAnswer = this.verbs[this.currentQuestionIndex].answer;

      if (!isCorrect) {
        this.hasAnsweredWrong = true; // Markiere die Frage als falsch beantwortet
        this.feedback = false; // Zeige "Falsch!" an
        this.$emit('updateStatistics', this.currentQuestionIndex, false);
      } else {
        this.feedback = true; // Zeige "Richtig!" an
        if (!this.hasAnsweredWrong) {
          this.correctAnswers++;
          this.$emit('updateStatistics', this.currentQuestionIndex, true);
        }
        // Bei richtiger Antwort automatisch zur nächsten Frage nach 500 ms
        setTimeout(() => {
          this.nextQuestion();
        }, 500);
      }
    },
    nextQuestion() {
      if (this.feedback !== null) {
        this.currentQuestionIndex++;
        this.userAnswer = '';
        this.feedback = null;
        this.correctAnswer = '';
        this.hasAnsweredWrong = false;
      }
    },
    completeLesson() {
      this.$emit('lessonComplete', this.correctAnswers);
    },
    resetState() {
      this.currentQuestionIndex = 0;
      this.userAnswer = '';
      this.correctAnswers = 0;
      this.feedback = null;
      this.correctAnswer = '';
      this.hasAnsweredWrong = false;
    },
  },
};
</script>

<style scoped>
div {
  margin-bottom: 20px;
}
</style>

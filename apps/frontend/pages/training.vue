<template>
  <div class="fade-in min-h-screen bg-gray-50">
    <!-- Header Section -->
    <section
      class="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 py-16 overflow-hidden"
    >
      <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center">
          <div
            class="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"
              ></path>
            </svg>
            📘 AI-Powered Training Modules
          </div>
          <h1
            class="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Adaptive
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600"
            >
              Accessibility Quiz
            </span>
          </h1>
          <p
            class="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8"
          >
            Test your knowledge with AI-generated quizzes based on the
            accessibility issues found on your website
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Step 1: Generate Quiz from Issues -->
      <div v-if="!quiz && !isGeneratingQuiz" class="card mb-8">
        <div class="text-center">
          <div
            class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <svg
              class="w-10 h-10 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            Generate Quiz from Your Issues
          </h2>
          <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
            To generate a personalized quiz, you need to analyze a website
            first. The quiz will be created based on the accessibility issues
            found.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/analyze"
              class="btn-primary inline-flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                ></path>
              </svg>
              Analyze Website First
            </NuxtLink>
            <button
              v-if="hasStoredIssues"
              @click="generateQuizFromStoredIssues"
              class="btn-secondary inline-flex items-center justify-center"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                ></path>
              </svg>
              Use Previous Analysis
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isGeneratingQuiz" class="card mb-8">
        <div class="text-center py-12">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"
          ></div>
          <p class="text-gray-600 text-lg">
            Generating your personalized quiz...
          </p>
        </div>
      </div>

      <!-- Quiz Taking Interface -->
      <div v-if="quiz && !quizResult && !isEvaluating" class="space-y-6">
        <!-- Quiz Info -->
        <div class="card">
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                {{ quiz.title }}
              </h2>
              <p class="text-gray-600">{{ quiz.description }}</p>
            </div>
            <div class="mt-4 md:mt-0 flex flex-wrap gap-4 text-sm">
              <div class="flex items-center text-gray-600">
                <svg
                  class="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                ~{{ quiz.estimatedTime }} min
              </div>
              <div class="flex items-center text-gray-600">
                <svg
                  class="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  ></path>
                </svg>
                {{ quiz.totalPoints }} points
              </div>
              <div class="flex items-center text-gray-600">
                <svg
                  class="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                {{ quiz.questions.length }} questions
              </div>
            </div>
          </div>
        </div>

        <!-- Topics Covered -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Topics Covered
          </h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="topic in quiz.topics"
              :key="topic"
              class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
            >
              {{ topic }}
            </span>
          </div>
        </div>

        <!-- Questions -->
        <div
          v-for="(question, index) in quiz.questions"
          :key="question.id"
          class="card"
        >
          <div class="flex items-start mb-4">
            <div
              class="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold mr-4"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                >
                  {{ questionTypeLabel(question.type) }}
                </span>
                <span
                  class="px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs font-medium"
                >
                  {{ question.points }} pts
                </span>
                <span
                  class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                >
                  {{ question.topic }}
                </span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                {{ question.question }}
              </h3>

              <!-- Scenario -->
              <div
                v-if="question.scenario"
                class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4"
              >
                <p class="text-gray-700 italic">{{ question.scenario }}</p>
              </div>

              <!-- Code Snippet -->
              <div
                v-if="question.codeSnippet"
                class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto"
              >
                <pre
                  class="text-green-400 text-sm"
                ><code>{{ question.codeSnippet }}</code></pre>
              </div>

              <!-- MCQ Options -->
              <div v-if="question.type === 'mcq' && question.options">
                <div
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                  class="mb-3"
                >
                  <label
                    class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary-300"
                    :class="
                      getAnswer(question.id) === option
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200'
                    "
                  >
                    <input
                      type="radio"
                      :name="`question-${question.id}`"
                      :value="option"
                      :checked="getAnswer(question.id) === option"
                      @change="setAnswer(question.id, option)"
                      class="mt-1 mr-3"
                    />
                    <span class="text-gray-700">{{ option }}</span>
                  </label>
                </div>
              </div>

              <!-- True/False -->
              <div v-if="question.type === 'true-false'" class="flex gap-4">
                <label
                  class="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all flex-1"
                  :class="
                    getAnswer(question.id) === 'True'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  "
                >
                  <input
                    type="radio"
                    :name="`question-${question.id}`"
                    value="True"
                    :checked="getAnswer(question.id) === 'True'"
                    @change="setAnswer(question.id, 'True')"
                    class="mr-3"
                  />
                  <span class="text-gray-700 font-medium">True</span>
                </label>
                <label
                  class="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all flex-1"
                  :class="
                    getAnswer(question.id) === 'False'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  "
                >
                  <input
                    type="radio"
                    :name="`question-${question.id}`"
                    value="False"
                    :checked="getAnswer(question.id) === 'False'"
                    @change="setAnswer(question.id, 'False')"
                    class="mr-3"
                  />
                  <span class="text-gray-700 font-medium">False</span>
                </label>
              </div>

              <!-- Code Answer -->
              <div v-if="question.type === 'code'" class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Fix the code above:
                </label>
                <textarea
                  :value="getAnswer(question.id)"
                  @input="
                    setAnswer(
                      question.id,
                      ($event.target as HTMLTextAreaElement).value,
                    )
                  "
                  placeholder="Enter your code fix here..."
                  class="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 font-mono text-sm"
                  rows="6"
                ></textarea>
              </div>

              <!-- Scenario Answer -->
              <div v-if="question.type === 'scenario'" class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Your answer:
                </label>
                <textarea
                  :value="getAnswer(question.id)"
                  @input="
                    setAnswer(
                      question.id,
                      ($event.target as HTMLTextAreaElement).value,
                    )
                  "
                  placeholder="Describe what's wrong and how to fix it..."
                  class="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  rows="4"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div
          class="card bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-300 shadow-lg"
        >
          <div
            class="flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-700 mb-1">
                Quiz Progress
              </p>
              <div class="flex items-center gap-2">
                <div
                  class="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden"
                >
                  <div
                    class="bg-gradient-to-r from-primary-500 to-accent-500 h-full transition-all duration-300 rounded-full"
                    :style="{
                      width: `${(answeredCount / quiz.questions.length) * 100}%`,
                    }"
                  ></div>
                </div>
                <span
                  class="text-sm font-semibold text-gray-700 min-w-[80px] text-right"
                >
                  {{ answeredCount }}/{{ quiz.questions.length }}
                </span>
              </div>
              <p
                v-if="answeredCount < quiz.questions.length"
                class="text-xs text-gray-500 mt-2"
              >
                Please answer all questions before submitting
              </p>
            </div>
            <button
              @click="submitQuiz"
              :disabled="answeredCount < quiz.questions.length || isEvaluating"
              class="btn-primary inline-flex items-center justify-center px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg min-w-[160px]"
            >
              <svg
                v-if="!isEvaluating"
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <svg
                v-else
                class="w-5 h-5 mr-2 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              {{ isEvaluating ? 'Submitting...' : 'Submit Quiz' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Evaluating State -->
      <div v-if="isEvaluating" class="card">
        <div class="text-center py-12">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"
          ></div>
          <p class="text-gray-600 text-lg">Evaluating your answers...</p>
        </div>
      </div>

      <!-- Results -->
      <div v-if="quizResult" class="space-y-6">
        <!-- Score Summary -->
        <div class="card bg-gradient-to-r from-primary-50 to-accent-50">
          <div class="text-center">
            <div
              class="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
              :class="
                quizResult.percentage >= 80
                  ? 'bg-green-100'
                  : quizResult.percentage >= 60
                    ? 'bg-yellow-100'
                    : 'bg-red-100'
              "
            >
              <span
                class="text-4xl font-bold"
                :class="
                  quizResult.percentage >= 80
                    ? 'text-green-600'
                    : quizResult.percentage >= 60
                      ? 'text-yellow-600'
                      : 'text-red-600'
                "
              >
                {{ quizResult.percentage }}%
              </span>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">
              Quiz Complete!
            </h2>
            <p class="text-gray-600 mb-4">
              You scored {{ quizResult.score }} out of
              {{ quizResult.totalPoints }} points
            </p>
            <div class="flex flex-wrap justify-center gap-4 text-sm">
              <div class="px-4 py-2 bg-white rounded-lg shadow">
                <div class="font-semibold text-gray-900">
                  {{ correctAnswersCount }}/{{ quizResult.answers.length }}
                </div>
                <div class="text-gray-600">Correct</div>
              </div>
              <div class="px-4 py-2 bg-white rounded-lg shadow">
                <div class="font-semibold text-gray-900">
                  {{ quizResult.topicsToReview.length }}
                </div>
                <div class="text-gray-600">Topics to Review</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div v-if="quizResult.recommendations.length > 0" class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Recommendations
          </h3>
          <ul class="space-y-2">
            <li
              v-for="(rec, index) in quizResult.recommendations"
              :key="index"
              class="flex items-start"
            >
              <svg
                class="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <span class="text-gray-700">{{ rec }}</span>
            </li>
          </ul>
        </div>

        <!-- Topics to Review -->
        <div
          v-if="quizResult.topicsToReview.length > 0"
          class="card border-l-4 border-yellow-400 bg-yellow-50"
        >
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Topics to Review
          </h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="topic in quizResult.topicsToReview"
              :key="topic"
              class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
            >
              {{ topic }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mt-4">
            Consider reviewing the training modules for these topics to improve
            your understanding.
          </p>
        </div>

        <!-- Detailed Results -->
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">
            Detailed Results
          </h3>
          <div class="space-y-6">
            <div
              v-for="(answer, index) in quizResult.answers"
              :key="answer.questionId"
              class="border-l-4 p-4 rounded"
              :class="
                answer.isCorrect
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
              "
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="font-semibold text-gray-900"
                      >Question {{ index + 1 }}</span
                    >
                    <span
                      class="px-2 py-1 rounded text-xs font-medium"
                      :class="
                        answer.isCorrect
                          ? 'bg-green-200 text-green-800'
                          : 'bg-red-200 text-red-800'
                      "
                    >
                      {{ answer.isCorrect ? 'Correct' : 'Incorrect' }}
                    </span>
                    <span class="text-sm text-gray-600"
                      >{{ answer.pointsEarned }}/{{
                        answer.pointsPossible
                      }}
                      points</span
                    >
                  </div>
                  <p class="text-gray-700 mb-3">{{ answer.question }}</p>
                  <div class="space-y-2 text-sm">
                    <div>
                      <span class="font-medium text-gray-700"
                        >Your answer:</span
                      >
                      <p class="text-gray-600 mt-1">
                        {{ answer.userAnswer || 'No answer provided' }}
                      </p>
                    </div>
                    <div v-if="!answer.isCorrect">
                      <span class="font-medium text-gray-700"
                        >Correct answer:</span
                      >
                      <p class="text-gray-600 mt-1">
                        {{
                          Array.isArray(answer.correctAnswer)
                            ? answer.correctAnswer.join(', ')
                            : answer.correctAnswer
                        }}
                      </p>
                    </div>
                    <div class="mt-3 p-3 bg-white rounded border">
                      <span class="font-medium text-gray-700"
                        >Explanation:</span
                      >
                      <p class="text-gray-600 mt-1">{{ answer.explanation }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            @click="takeAnotherQuiz"
            :disabled="isGeneratingQuiz"
            class="btn-secondary flex-1 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            {{ isGeneratingQuiz ? 'Generating...' : 'Take Another Quiz' }}
          </button>
          <NuxtLink
            to="/analyze"
            class="btn-primary flex-1 inline-flex items-center justify-center text-center"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              ></path>
            </svg>
            Analyze Another Website
          </NuxtLink>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="card border-l-4 border-red-500 bg-red-50">
        <div class="flex items-start">
          <svg
            class="w-5 h-5 text-red-600 mr-2 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-red-900 mb-1">Error</h3>
            <p class="text-red-700">{{ error }}</p>
            <button
              @click="error = null"
              class="mt-4 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  Quiz,
  QuizSubmission,
  QuizResult,
  Pa11yIssue,
} from '../types/accessibility';

const { generateQuiz, evaluateQuiz } = useQuizApi();
const accessibilityStore = useAccessibilityStore();
const route = useRoute();

// State
const quiz = ref<Quiz | null>(null);
const quizResult = ref<QuizResult | null>(null);
const answers = ref<Record<string, string>>({});
const isGeneratingQuiz = ref(false);
const isEvaluating = ref(false);
const error = ref<string | null>(null);

// Computed
const hasStoredIssues = computed(() => {
  return (
    accessibilityStore.results?.issues &&
    accessibilityStore.results.issues.length > 0
  );
});

const answeredCount = computed(() => {
  if (!quiz.value) return 0;
  return quiz.value.questions.filter((q) => answers.value[q.id]).length;
});

const correctAnswersCount = computed(() => {
  if (!quizResult.value) return 0;
  return quizResult.value.answers.filter((a) => a.isCorrect).length;
});

// Methods
const questionTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    mcq: 'Multiple Choice',
    code: 'Code Fix',
    'true-false': 'True/False',
    scenario: 'Scenario',
  };
  return labels[type] || type;
};

const getAnswer = (questionId: string): string => {
  return answers.value[questionId] || '';
};

const setAnswer = (questionId: string, answer: string) => {
  answers.value[questionId] = answer;
};

const generateQuizFromStoredIssues = async () => {
  if (!accessibilityStore.results?.issues) {
    error.value = 'No issues found in stored results';
    return;
  }

  await generateQuizFromIssues(accessibilityStore.results.issues);
};

const generateQuizFromIssues = async (issues: Pa11yIssue[]) => {
  isGeneratingQuiz.value = true;
  error.value = null;

  try {
    const generatedQuiz = await generateQuiz(issues);
    quiz.value = generatedQuiz;
    answers.value = {};
    quizResult.value = null;
  } catch (err: any) {
    error.value = err.message || 'Failed to generate quiz';
    console.error('Quiz generation error:', err);
  } finally {
    isGeneratingQuiz.value = false;
  }
};

const submitQuiz = async () => {
  if (!quiz.value) return;

  const submissions: QuizSubmission[] = quiz.value.questions.map((q) => ({
    questionId: q.id,
    answer: answers.value[q.id] || '',
  }));

  isEvaluating.value = true;
  error.value = null;

  try {
    const result = await evaluateQuiz(quiz.value, submissions);
    quizResult.value = result;
  } catch (err: any) {
    error.value = err.message || 'Failed to evaluate quiz';
    console.error('Quiz evaluation error:', err);
  } finally {
    isEvaluating.value = false;
  }
};

const resetQuiz = () => {
  quiz.value = null;
  quizResult.value = null;
  answers.value = {};
  error.value = null;
};

const takeAnotherQuiz = async () => {
  // Reset current quiz state
  quizResult.value = null;
  answers.value = {};
  error.value = null;

  // Try to regenerate from stored issues first
  if (hasStoredIssues.value && accessibilityStore.results?.issues) {
    await generateQuizFromIssues(accessibilityStore.results.issues);
    return;
  }

  // Try to regenerate from route query
  const issuesParam = route.query.issues;
  if (issuesParam && typeof issuesParam === 'string') {
    try {
      const issues: Pa11yIssue[] = JSON.parse(issuesParam);
      if (issues.length > 0) {
        await generateQuizFromIssues(issues);
        return;
      }
    } catch (err) {
      console.error('Failed to parse issues from query:', err);
    }
  }

  // If no issues available, just reset to initial state
  resetQuiz();
};

// Check for issues passed via route query
onMounted(() => {
  const issuesParam = route.query.issues;
  if (issuesParam && typeof issuesParam === 'string') {
    try {
      const issues: Pa11yIssue[] = JSON.parse(issuesParam);
      if (issues.length > 0) {
        generateQuizFromIssues(issues);
      }
    } catch (err) {
      console.error('Failed to parse issues from query:', err);
    }
  }
});
</script>

<style scoped>
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
